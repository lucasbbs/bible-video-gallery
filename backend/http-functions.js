import { ok, notFound, serverError, badRequest } from 'wix-http-functions'
import wixData from 'wix-data'
import { mediaManager } from 'wix-media-backend'

const newDatabaseTable = 'sermons'
const sermonTagsCollection = 'sermon_tags'
// https://ivanzurita17.wixstudio.com/cbcupdated/_functions/videos//?book=luke&page=1
export async function get_videos(request) {
    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }

    try {
        const q = request.query || {}

        const firstQueryValue = (value) =>
            Array.isArray(value) ? value[0] : value

        const normalizeStringParam = (value) => {
            const v = firstQueryValue(value)
            if (typeof v !== 'string') return null
            const s = v.trim()
            if (!s || s === 'null' || s === 'undefined') return null
            return s
        }

        const parsePositiveInt = (value, fallback) => {
            const n = Number(firstQueryValue(value))
            if (!Number.isFinite(n) || n <= 0) return fallback
            return Math.floor(n)
        }

        const parseNullablePositiveInt = (value) => {
            const n = Number(firstQueryValue(value))
            if (!Number.isFinite(n) || n <= 0) return null
            return Math.floor(n)
        }

        const book = normalizeStringParam(q.book)
        const chapter = parseNullablePositiveInt(q.chapter)
        const page = parsePositiveInt(q.page, 1)
        const per_page = Math.min(parsePositiveInt(q.per_page, 20), 1000)
        const includeChapters =
            String(firstQueryValue(q.include_chapters) || '')
                .trim()
                .toLowerCase() === '1'
        // Optional tags filtering (supports CSV or array)
        const match = String(q.match || 'any').toLowerCase() // 'any' | 'all'
        const rawTags = q.tags
        const tagsFilter = Array.isArray(rawTags)
            ? rawTags
            : typeof rawTags === 'string'
              ? rawTags
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
              : []
        // If filtering by tags, fetch matching tag record ids first
        let tagIds = []
        let tagsMap = new Map()
        if (tagsFilter.length) {
            let tQuery = wixData.query(sermonTagsCollection)
            tQuery =
                match === 'all'
                    ? tQuery.hasAll('tags', tagsFilter)
                    : tQuery.hasSome('tags', tagsFilter)

            let tSkip = 0
            const tPageSize = 50
            let tTotal = 0
            do {
                const res = await tQuery.skip(tSkip).limit(tPageSize).find()
                if (!res.items.length) break
                for (const it of res.items) {
                    if (it && it._id) {
                        tagIds.push(it._id)
                        tagsMap.set(it._id, it.tags || [])
                    }
                }
                tSkip += res.items.length
                tTotal = res.totalCount
            } while (tSkip < tTotal)

            if (!tagIds.length) {
                options.body = {
                    videos: [],
                    total: 0,
                    ...(includeChapters ? { chapters: [] } : {})
                }
                return ok(options)
            }
        }

        const applyTagsFilter = (builder) => {
            if (!tagsFilter.length) return builder

            if (typeof builder.in === 'function') {
                return builder.in('sermonTagsId', tagIds)
            }

            let b = wixData.query(newDatabaseTable).eq('sermonTagsId', tagIds[0])
            for (const id of tagIds.slice(1)) {
                b = b.or(
                    wixData.query(newDatabaseTable).eq('sermonTagsId', id)
                )
            }
            return builder.and(b)
        }

        let builder = wixData.query(newDatabaseTable)
        if (book) builder = builder.eq('book', book)
        if (chapter != null) {
            builder = builder.and(
                wixData
                    .query(newDatabaseTable)
                    .eq('chapter', chapter)
                    .or(
                        wixData
                            .query(newDatabaseTable)
                            .eq('chapter', String(chapter))
                    )
            )
        }
        builder = applyTagsFilter(builder)

        const query = await builder
            .descending('createdTime')
            .skip((page - 1) * per_page)
            .limit(per_page)
            .find()

        const totalCount = query.totalCount
        let videos = query.items

        let chapters = []
        if (includeChapters && book && book !== 'others') {
            const chapterSet = new Set()

            let cSkip = 0
            let cTotal = 0
            const cPageSize = 1000

            let chaptersBuilder = wixData.query(newDatabaseTable).eq('book', book)
            chaptersBuilder = applyTagsFilter(chaptersBuilder)

            do {
                const res = await chaptersBuilder
                    .skip(cSkip)
                    .limit(cPageSize)
                    .find()

                for (const item of res.items) {
                    const itemBook = item?.book || book
                    let description = item?.description || ''
                    if (itemBook === 'Psalms' && description) {
                        description = description.replace(/^Psalm\b/, 'Psalms')
                    }

                    let chapterValue = Number(item?.chapter)
                    if (!Number.isFinite(chapterValue) || chapterValue <= 0) {
                        const beforeColon = String(description).split(':')[0] || ''
                        const raw = itemBook
                            ? beforeColon.replace(itemBook, '').trim()
                            : beforeColon.trim()
                        const parsed = Number(raw)
                        chapterValue = Number.isFinite(parsed) ? parsed : 0
                    }

                    if (chapterValue > 0) chapterSet.add(chapterValue)
                }

                cSkip += res.items.length
                cTotal = res.totalCount
            } while (cSkip < cTotal)

            chapters = Array.from(chapterSet).sort((a, b) => a - b)
        }

        videos = videos.map((item) => {
            const itemBook = item?.book || book
            let description = item?.description || ''

            // Replace "Psalm" with "Psalms" if the book is "Psalms"
            if (itemBook === 'Psalms' && description) {
                description = description.replace(/^Psalm\b/, 'Psalms')
            }

            let chapterValue = Number(item?.chapter)
            if (!Number.isFinite(chapterValue) || chapterValue <= 0) {
                const beforeColon = String(description).split(':')[0] || ''
                const raw = itemBook
                    ? beforeColon.replace(itemBook, '').trim()
                    : beforeColon.trim()
                const parsed = Number(raw)
                chapterValue = Number.isFinite(parsed) ? parsed : 0
            }

            return {
                ...item,
                chapter: chapterValue,
                sermonTagsId: item?.sermonTagsId || null,
                tags:
                    (item?.sermonTagsId && tagsMap.get(item.sermonTagsId)) ||
                    item?.tags ||
                    [],
                description: chapterValue
                    ? `${itemBook} ${chapterValue}:${item.verses}`
                    : description
            }
        })

        options.body = {
            videos,
            total: totalCount,
            ...(includeChapters ? { chapters } : {})
        }
        return ok(options)
    } catch (error) {
        options.body = { error: error.message }
        return serverError(options)
    }
}

export async function get_vimeo_videos(request) {
    const VIMEO_API_URL = 'https://api.vimeo.com'
    const BEARER_TOKEN = 'a0e43f13386374ad6d3252029dc19047'
    const page = request.query.page
    const per_page = request.query.per_page
    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        }
    }

    const url = `${VIMEO_API_URL}/me/videos?per_page=${per_page}&page=${page}`
    const vimeoOptions = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`
        }
    }

    try {
        const response = await fetch(url, vimeoOptions)
        const data = await response.json()

        options.body = {
            data: {
                ...data
            }
        }
        return ok(options)
    } catch (error) {
        console.error('Error fetching videos from Vimeo:', error)
        throw new Error('Error fetching videos')
    }
}

export async function get_myFunction(request) {
    const options = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    try {
        const results = await wixData.query('MyCollection').find()
        if (results.items.length > 0) {
            options.body = { items: results.items } // Extract relevant data
            return ok(options) // Return as a valid HTTP response
        } else {
            options.body = { error: 'No items found' }
            return notFound(options)
        }
    } catch (error) {
        options.body = { error: error.message }
        return serverError(options)
    }
}

// Handle preflight for /_functions/videos
export function options_videos(request) {
    const origin = request?.headers?.origin
    return ok({ headers: corsHeaders(origin) })
}

const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://bible-video-gallery-submit-form.netlify.app',
    'https://campbell-sermon-gallery-v2.netlify.app',
    'https://fascinating-fudge-8a8c5a.netlify.app',
    'http://localhost:5173'
] // whitelist
function corsHeaders(origin, requestHeaders = '') {
    const allowOrigin = ALLOWED_ORIGINS.includes(origin)
        ? origin
        : ALLOWED_ORIGINS[0]

    const defaultAllow = [
        'Content-Type',
        'Authorization',
        'X-HTTP-Method-Override'
    ]
    const requested = String(requestHeaders)
        .split(',')
        .map((h) => h.trim())
        .filter(Boolean)

    const allowHeaders = Array.from(
        new Set([...defaultAllow, ...requested])
    ).join(', ')

    return {
        'Access-Control-Allow-Origin': allowOrigin,
        Vary: 'Origin',
        'Access-Control-Allow-Headers': allowHeaders,
        'Access-Control-Allow-Methods': 'POST, OPTIONS, PUT, GET, DELETE',
        'Access-Control-Max-Age': '86400'
    }
}

function getVimeoId(url) {
    const match = url.match(/vimeo\.com\/(\d+)/)
    return match ? match[1] : null
}

function b64ToBuffer(base64) {
    // Ensure clean base64 (strip potential "data:application/pdf;base64," prefix if present)
    const clean = String(base64).replace(/^data:.*;base64,/, '')

    return Buffer.from(clean, 'base64')
}

export async function post_videos(request) {
    const origin = request?.headers?.origin
    try {
        const payload = await request.body.json().catch(() => null)

        if (!payload)
            return badRequest({ body: { error: 'Invalid JSON body.' } })

        const {
            book,
            chapter = null,
            verses = null,
            url,
            title = '',
            audioUrl = '',
            sermonPdfBase64 = '',
            sermonPdfName = 'sermon.pdf',
            sermonPath = '/sermons',
            description,
            createdAt = null,
            tags
        } = payload

        if (!book || !url)
            return badRequest({ body: { error: 'book and url are required.' } })

        const collection = newDatabaseTable

        let sermonPdf = null

        if (sermonPdfBase64) {
            const fileBuffer = b64ToBuffer(sermonPdfBase64)
            const path = `${sermonPath}/${encodeURIComponent(book)}`

            const fileInfo = await mediaManager.upload(
                path,
                fileBuffer,
                sermonPdfName || 'sermon.pdf',
                {
                    mediaOptions: {
                        mediaType: 'document',
                        mimeType: 'application/pdf'
                    },
                    metadataOptions: {
                        context: { book, chapter, verses, title }
                    }
                }
            )

            sermonPdf = {
                fileUrl: fileInfo.fileUrl,
                internalName: fileInfo.fileName
            }
        }

        // Normalize tags (array or CSV string)
        const normalizedTags = Array.isArray(tags)
            ? tags
            : typeof tags === 'string'
              ? tags
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
              : []

        // Create a sermon_tags document and keep its id
        let sermonTagsId = null
        if (normalizedTags.length) {
            const tagDoc = await wixData.insert(
                sermonTagsCollection,
                { tags: normalizedTags },
                { suppressAuth: true }
            )
            sermonTagsId = tagDoc._id
        }

        const item = {
            name: title,
            book,
            videoLink: url,
            title: getVimeoId(url),
            description,
            audioUrl,
            sermonPdf,
            chapter,
            verses,
            tags: normalizedTags,
            sermonTagsId,
            published: false,
            createdTime: createdAt ? new Date(createdAt) : new Date()
        }
        const saved = await wixData.insert(collection, item, {
            suppressAuth: true
        })
        return ok({
            body: { success: true, collection, id: saved._id, item: saved },
            headers: corsHeaders(origin)
        })
    } catch (err) {
        return serverError({
            body: {
                error: 'Internal error',
                details: String(err?.message || err)
            },
            headers: corsHeaders(origin)
        })
    }
}

export function options_video(request) {
    const origin = request?.headers?.origin
    return ok({ body: {}, headers: corsHeaders(origin) })
}

export function options_download(request) {
    const origin = request?.headers?.origin
    const acrh = request?.headers?.['access-control-request-headers']
    return ok({ headers: corsHeaders(origin, acrh) })
}

export async function get_download(request) {
    const origin = request?.headers?.origin
    const q = request.query || {}
    const fileParam = q.file
    if (!fileParam) {
        return badRequest({ body: { error: '`file` query param is required' } })
    }

    try {
        const fileUrl = decodeURIComponent(String(fileParam))

        const signedUrl = await mediaManager.getDownloadUrl(fileUrl)

        const headers = corsHeaders(origin)

        // Redirect the caller to the actual download URL
        return ok({
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(origin)
            },
            body: { url: signedUrl }
        })
    } catch (e) {
        // Hide internals; return 404 if file not found or not accessible
        return notFound({ body: { error: 'File not found or inaccessible' } })
    }
}

export async function put_videos(request) {
    const origin = request?.headers?.origin

    try {
        const payload = await request.body.json().catch(() => null)
        if (!payload) {
            return badRequest({
                body: { error: 'Invalid JSON body.' },
                headers: corsHeaders(origin)
            })
        }

        const {
            id,
            book,
            title,
            chapter = null,
            verses = null,
            url,
            audioUrl,
            sermonPdfBase64,
            sermonPdfName = 'sermon.pdf',
            sermonPath = '/sermons',
            description,
            createdAt,
            tags
        } = payload

        if (!id || !book) {
            return badRequest({
                body: { error: '`id` and `book` are required.' },
                headers: corsHeaders(origin)
            })
        }

        const collection = newDatabaseTable

        // Load the existing item
        const existing = await wixData.get(collection, id).catch(() => null)
        if (!existing) {
            return notFound({
                body: { error: 'Sermon not found.' },
                headers: corsHeaders(origin)
            })
        }

        let sermonPdf = existing.sermonPdf || null

        // Re-upload PDF if provided
        if (sermonPdfBase64) {
            const fileBuffer = b64ToBuffer(sermonPdfBase64)
            const path = `${sermonPath}/${encodeURIComponent(book)}`

            const fileInfo = await mediaManager.upload(
                path,
                fileBuffer,
                sermonPdfName,
                {
                    mediaOptions: {
                        mediaType: 'document',
                        mimeType: 'application/pdf'
                    },
                    metadataOptions: {
                        context: { book, chapter, verses, title }
                    }
                }
            )

            sermonPdf = {
                fileUrl: fileInfo.fileUrl,
                internalName: fileInfo.fileName
            }
        }

        // Normalize tags only if provided
        const updatedTags =
            tags === undefined
                ? undefined
                : Array.isArray(tags)
                  ? tags
                  : typeof tags === 'string'
                    ? tags
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean)
                    : []

        // Upsert sermon_tags document when tags explicitly provided
        let sermonTagsId = existing.sermonTagsId || null
        if (updatedTags !== undefined) {
            if (sermonTagsId) {
                try {
                    await wixData.update(
                        sermonTagsCollection,
                        { _id: sermonTagsId, tags: updatedTags },
                        { suppressAuth: true }
                    )
                } catch (e) {
                    // If the referenced doc is missing, create a new one
                    const created = await wixData.insert(
                        sermonTagsCollection,
                        { tags: updatedTags },
                        { suppressAuth: true }
                    )
                    sermonTagsId = created._id
                }
            } else if (updatedTags.length) {
                const created = await wixData.insert(
                    sermonTagsCollection,
                    { tags: updatedTags },
                    { suppressAuth: true }
                )
                sermonTagsId = created._id
            }
        }

        const updatedItem = {
            ...existing,
            title: getVimeoId(url) ?? existing.title,
            videoLink: url ?? existing.videoLink,
            book,
            description,
            audioUrl: audioUrl ?? existing.audioUrl,
            sermonPdf,
            chapter,
            verses,
            tags: updatedTags === undefined ? existing.tags : updatedTags,
            sermonTagsId,
            createdTime: createdAt ? new Date(createdAt) : existing.createdTime,
            name: title
        }

        const saved = await wixData.update(collection, updatedItem, {
            suppressAuth: true
        })

        return ok({
            body: { success: true, collection, id: saved._id, item: saved },
            headers: corsHeaders(origin)
        })
    } catch (err) {
        return serverError({
            body: {
                error: 'Failed to update sermon',
                details: String(err?.message || err)
            },
            headers: corsHeaders(origin)
        })
    }
}

export function options_publish(request) {
    const origin = request?.headers?.origin
    const acrh = request?.headers?.['access-control-request-headers']
    return ok({ headers: corsHeaders(origin, acrh) })
}

export async function put_publish(request) {
    const origin = request?.headers?.origin

    try {
        const body = await request.body.json().catch(() => null)
        if (!body || !body.id || !body.book) {
            return badRequest({
                headers: corsHeaders(origin),
                body: { error: '`id` and `book` are required.' }
            })
        }

        const { id, book, published } = body
        const collection = newDatabaseTable

        const existing = await wixData.get(collection, id).catch(() => null)
        if (!existing) {
            return notFound({
                headers: corsHeaders(origin),
                body: { error: 'Sermon not found.' }
            })
        }

        const nextPublished =
            typeof published === 'boolean'
                ? published
                : !Boolean(existing.published)

        const updated = await wixData.update(
            collection,
            {
                ...existing,
                published: nextPublished
            },
            { suppressAuth: true }
        )

        return ok({
            headers: corsHeaders(
                origin,
                request?.headers?.['access-control-request-headers']
            ),
            body: {
                success: true,
                collection,
                id: updated._id,
                previous: Boolean(existing.published),
                current: Boolean(updated.published)
            }
        })
    } catch (err) {
        return serverError({
            headers: corsHeaders(origin),
            body: {
                error: 'Failed to publish/unpublish',
                details: String(err?.message || err)
            }
        })
    }
}

export async function delete_videos(request) {
    const origin = request?.headers?.origin

    try {
        // Accept id/book from query OR body
        const q = request.query || {}
        let id = q.id
        let book = q.book

        if (!id || !book) {
            const body = await request.body.json().catch(() => null)
            id = id || body?.id
            book = book || body?.book
        }

        if (!id || !book) {
            return badRequest({
                headers: corsHeaders(origin),
                body: { error: '`id` and `book` are required.' }
            })
        }

        const collection = newDatabaseTable

        // 1) Load the existing item
        const existing = await wixData.get(collection, id).catch(() => null)
        if (!existing) {
            return notFound({
                headers: corsHeaders(origin),
                body: { error: 'Sermon not found.' }
            })
        }

        // 2) If it has a PDF, try to delete it first
        let pdfDelete = {
            attempted: false,
            success: false,
            used: null,
            error: null
        }
        const pdf = existing.sermonPdf
        if (pdf && (pdf.internalName || pdf.fileUrl)) {
            pdfDelete.attempted = true
            try {
                // Prefer the stored internalName returned by upload()
                if (pdf.internalName) {
                    await mediaManager.moveFilesToTrash(pdf.internalName)
                    pdfDelete.success = true
                    pdfDelete.used = { internalName: pdf.internalName }
                } else if (pdf.fileUrl) {
                    // Fallback: try to derive a file ID from the URL path (best-effort)
                    const last = new URL(pdf.fileUrl).pathname.split('/')
                    if (last) {
                        await mediaManager.moveFilesToTrash(last)
                        pdfDelete.success = true
                        pdfDelete.used = { derivedFromUrl: last }
                    } else {
                        throw new Error('Could not derive file id from fileUrl')
                    }
                }
            } catch (e) {
                // Don’t fail the whole request—report the error and continue
                pdfDelete.error = String(e?.message || e)
            }
        }

        // 3) Remove the DB record
        const removed = await wixData.remove(collection, id, {
            suppressAuth: true
        })

        return ok({
            headers: corsHeaders(origin),
            body: {
                success: true,
                collection,
                id,
                pdfDelete,
                removed: { _id: removed?._id ?? id }
            }
        })
    } catch (err) {
        return serverError({
            headers: corsHeaders(origin),
            body: {
                error: 'Failed to delete sermon',
                details: String(err?.message || err)
            }
        })
    }
}

export async function get_sermons(request) {
    const origin = request?.headers?.origin
    const q = request.query || {}

    const name = (q.name || '').trim()
    const startStr = (q.start || '').trim()
    const endStr = (q.end || '').trim()
    const page = Math.max(1, parseInt(q.page || '1', 10))
    const perPage = Math.min(100, Math.max(1, parseInt(q.per_page || '30', 10)))

    // Optional tags filter (supports CSV or array)
    const rawTags = q.tags
    const tagsFilter = Array.isArray(rawTags)
        ? rawTags
        : typeof rawTags === 'string'
          ? rawTags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
          : []
    const match = (q.match || 'any').toLowerCase() // 'any' | 'all'

    // Optional: limit which books to return (supports CSV or array)
    const rawBooks = q.books
    const booksFilter = Array.isArray(rawBooks)
        ? rawBooks
        : typeof rawBooks === 'string'
          ? rawBooks
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
          : []

    let startDate = null,
        endDate = null
    if (startStr) {
        const d = new Date(startStr)
        if (isNaN(d.getTime())) {
            return badRequest({
                body: {
                    error: 'Invalid `start` date. Use ISO format (YYYY-MM-DD).'
                },
                headers: corsHeaders(origin)
            })
        }
        startDate = d
    }
    if (endStr) {
        const d = new Date(endStr)
        if (isNaN(d.getTime())) {
            return badRequest({
                body: {
                    error: 'Invalid `end` date. Use ISO format (YYYY-MM-DD).'
                },
                headers: corsHeaders(origin)
            })
        }
        // Make end inclusive by moving to end of the day if only a date was provided
        if (/^\d{4}-\d{2}-\d{2}$/.test(endStr)) d.setHours(23, 59, 59, 999)
        endDate = d
    }

    try {
        // If filtering by tags, find matching tag record ids once
        let tagIds = []
        let tagsMap = new Map()
        if (tagsFilter.length) {
            let tQuery = wixData.query(sermonTagsCollection)
            tQuery =
                match === 'all'
                    ? tQuery.hasAll('tags', tagsFilter)
                    : tQuery.hasSome('tags', tagsFilter)

            let tSkip = 0
            const tPageSize = 50
            let tTotal = 0
            do {
                const res = await tQuery.skip(tSkip).limit(tPageSize).find()
                if (!res.items.length) break
                for (const it of res.items) {
                    if (it && it._id) {
                        tagIds.push(it._id)
                        tagsMap.set(it._id, it.tags || [])
                    }
                }
                tSkip += res.items.length
                tTotal = res.totalCount
            } while (tSkip < tTotal)

            if (!tagIds.length) {
                return ok({
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders(origin)
                    },
                    body: {
                        page,
                        per_page: perPage,
                        total: 0,
                        total_pages: 1,
                        items: []
                    }
                })
            }
        }

        let query = wixData.query(newDatabaseTable)

        if (name) {
            // Partial match on `name` or `description`
            query = query
                .contains('name', name)
                .or(
                    wixData
                        .query(newDatabaseTable)
                        .contains('description', name)
                )
        }

        if (startDate) query = query.ge('createdTime', startDate)
        if (endDate) query = query.le('createdTime', endDate)

        if (booksFilter.length) {
            if (typeof query.in === 'function') {
                query = query.in('book', booksFilter)
            } else {
                let b = wixData
                    .query(newDatabaseTable)
                    .eq('book', booksFilter[0])
                for (const bk of booksFilter.slice(1)) {
                    b = b.or(wixData.query(newDatabaseTable).eq('book', bk))
                }
                query = query.and(b)
            }
        }

        if (tagsFilter.length) {
            if (typeof query.in === 'function') {
                query = query.in('sermonTagsId', tagIds)
            } else {
                let b = wixData
                    .query(newDatabaseTable)
                    .eq('sermonTagsId', tagIds[0])
                for (const id of tagIds.slice(1)) {
                    b = b.or(
                        wixData.query(newDatabaseTable).eq('sermonTagsId', id)
                    )
                }
                query = query.and(b)
            }
        }

        // Sort newest first so pagination is stable
        query = query.descending('createdTime').ascending('_id')

        const skip = (page - 1) * perPage
        const res = await query.skip(skip).limit(perPage).find()

        // When tagsFilter isn't used, enrich the page results with sermon_tags.
        if (!tagsFilter.length) {
            const ids = Array.from(
                new Set(
                    res.items
                        .map((it) => it?.sermonTagsId)
                        .filter((v) => typeof v === 'string' && v.length > 0)
                )
            )

            if (ids.length) {
                let tQuery = wixData.query(sermonTagsCollection)
                if (typeof tQuery.in === 'function') {
                    tQuery = tQuery.in('_id', ids)
                } else {
                    let b = wixData
                        .query(sermonTagsCollection)
                        .eq('_id', ids[0])
                    for (const id of ids.slice(1)) {
                        b = b.or(
                            wixData.query(sermonTagsCollection).eq('_id', id)
                        )
                    }
                    tQuery = b
                }

                let tSkip = 0
                const tPageSize = 50
                let tTotal = 0
                do {
                    const tRes = await tQuery
                        .skip(tSkip)
                        .limit(tPageSize)
                        .find()
                    if (!tRes.items.length) break
                    for (const it of tRes.items) {
                        if (it && it._id) tagsMap.set(it._id, it.tags || [])
                    }
                    tSkip += tRes.items.length
                    tTotal = tRes.totalCount
                } while (tSkip < tTotal)
            }
        }

        const items = res.items.map((it) => ({
            id: it._id,
            collection: newDatabaseTable,
            book: it.book || '',
            name: it.name || '',
            description: it.description || '',
            url: it.videoLink || '',
            audioUrl: it.audioUrl || '',
            sermonPdf: it.sermonPdf || null,
            createdAt: it.createdTime || it._createdDate,
            verses: it.verses,
            chapter: it.chapter,
            tags:
                (it?.sermonTagsId && tagsMap.get(it.sermonTagsId)) ||
                it.tags ||
                [],
            published: it.published
        }))

        const total = res.totalCount
        const totalPages = Math.max(1, Math.ceil(total / perPage))

        return ok({
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(origin)
            },
            body: {
                page,
                per_page: perPage,
                total,
                total_pages: totalPages,
                items
            }
        })
    } catch (err) {
        return serverError({
            headers: corsHeaders(origin),
            body: {
                error: 'Failed to search sermons',
                details: String(err?.message || err)
            }
        })
    }
}
