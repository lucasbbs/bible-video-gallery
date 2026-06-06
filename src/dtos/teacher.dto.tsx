import { Teacher } from "@/types/teacher"

export class TeacherDTO {
    name: string
    createdAt?: Date

    private constructor(
        name: string,
        createdAt: Date,
    ) {
        this.name = name
        this.createdAt = createdAt
    }

    static async fromAPI(data: Teacher): Promise<TeacherDTO> {
      const createdAtDate = new Date(data.createdAt)

        return new TeacherDTO(
            data.name,
            createdAtDate
        )
    }
}
