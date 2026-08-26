import { TeacherDTO } from "@/dtos/teacher.dto"
import api from "./api"
import { Teacher } from "@/types/teacher"

type TeachersResponse = {
  items: Teacher[]
}

export const getTeachers = async () : Promise<TeacherDTO[]> => {
  const { data } = await api.get<TeachersResponse>('/teachers')
  return Promise.all(data.items.map(TeacherDTO.fromAPI))
}
