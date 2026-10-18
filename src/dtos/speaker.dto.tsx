import { Speaker } from "@/types/speaker"

export class SpeakerDTO {
    name: string
    createdAt?: Date

    private constructor(
        name: string,
        createdAt: Date,
    ) {
        this.name = name
        this.createdAt = createdAt
    }

    static async fromAPI(data: Speaker): Promise<SpeakerDTO> {
      const createdAtDate = new Date(data.createdAt)

        return new SpeakerDTO(
            data.name,
            createdAtDate
        )
    }
}
