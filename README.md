# 📖 Bible Video Gallery

![Static Badge](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Static Badge](https://img.shields.io/badge/License-Proprietary-red.svg)

A modern, responsive video gallery showcasing Bible-related content. This app allows users to browse, search, and view scripture-based videos in an elegant UI powered by React, Tailwind CSS, and Radix UI components.

|[![](https://img.youtube.com/vi/TEw3bM_ElD0/0.jpg)](https://youtu.be/TEw3bM_ElD0)| Watch the demo video |
|---------------------------------------------------------------------------------|------------------|
---

## 🚀 Features

- 🔍 **Search by Scripture**: Easily filter videos using Bible references
- 🎬 **Video Player & Modal**: Clean viewing experience with modal playback
- 🎛️ **Pagination & Filtering**: Browse large collections smoothly
- ⚙️ **Reusable UI Components**: Built with Radix primitives and custom logic
- 🌐 **Deployed via Netlify** for fast and secure hosting

---

## 🧱 Project Structure

```
src/
├── assets/                  # Static media (SVGs, images)
├── components/
│   ├── lib-ui/              # Core reusable UI components (modals, players, lists)
│   └── ui/                  # (Optional) global design components
├── lib/                     # Utilities (e.g., formatting, helpers)
│   └── utils.ts
├── services/                # API logic and data fetching
│   ├── api.ts
│   └── videos.ts
├── shared/                  # Shared variables
│   └── books.ts
├── App.tsx                  # App entry point
├── main.tsx                 # React DOM mount
├── index.css / App.css      # Styles
├── vite-env.d.ts            # Vite TypeScript env types
```

---

## 📦 Tech Stack

| Layer          | Stack                                           |
|----------------|--------------------------------------------------|
| **Framework**  | React 19, Vite, TypeScript                      |
| **Styling**    | Tailwind CSS, tailwind-merge, tailwindcss-animate |
| **UI**         | Radix UI, Lucide Icons                          |
| **Forms**      | React Hook Form + Zod                           |
| **Video**      | React Player                                    |
| **Routing**    | React Router v7                                 |
| **Deployment** | Netlify                                         |

---

## 🛠️ Scripts

| Command                | Action                                      |
|------------------------|---------------------------------------------|
| `npm run dev`          | Start local development server              |
| `npm run build`        | Build app for production                    |
| `npm run preview`      | Preview built app locally                   |
| `npm run lint`         | Lint the codebase                           |
| `npm run prod:cloud`   | Deploy to Netlify with preview              |
| `npm run build:cloud`  | Build then deploy to Netlify                |

---

## 🧪 Example Components

- `AllVideos.tsx`: Displays the full list of videos with pagination
- `SearchByScripture.tsx`: Handles search/filtering logic by Bible reference
- `VideoPlayer.tsx` + `VideoModal.tsx`: Encapsulate player inside a modal view
- `ListItem.tsx`: Displays single video card
- `SwitchButton.tsx`: Dark/light mode toggle

---

## :closed_book: License

Released in 2025 :closed_book: License

Made with :heart: by [Lucas Breno de Souza Noronha Braga](https://github.com/lucasbbs) 🚀.

This project is private. Contact the maintainer for collaboration or demo access.

---

### Contact
Lucas Breno de Souza Noronha Braga

[![Static Badge](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://api.whatsapp.com/send?phone=12267247739)
[![Static Badge](https://img.shields.io/badge/Microsoft_Outlook-0078D4?style=for-the-badge&logo=microsoft-outlook&logoColor=white)](mailto:lucasbbs@live.fr)
[![Static Badge](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/lucasbbs/)
[![Static Badge](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/Lucas-in-Canada/)