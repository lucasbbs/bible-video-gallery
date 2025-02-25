import { useState } from 'react'
import './App.css'
import { useForm } from "react-hook-form"

import { toast } from "sonner"
import {
  Form,
} from "@/components/ui/form"
import Selector from './components/Selector'

function onSubmit() {
  toast("Event has been created", {
    description: "Sunday, December 03, 2023 at 9:00 AM",
    action: {
      label: "Undo",
      onClick: () => console.log("Undo"),
    },
  })
}

function App() {
  const [] = useState(0)
  const form = useForm()

  return (
    <>
      <div className="card">

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-auto space-y-6">
            <div className="flex gap-20 flex-wrap justify-center">
              <Selector 
                form={form}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'old', label: 'Old Testament' },
                  { value: 'new', label: 'New Testament' },
                  { value: 'others', label: 'Others' }
                ]}
                formLabel="By Testament*"
              />
              <Selector 
                form={form}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'old', label: 'Old Testament' },
                  { value: 'new', label: 'New Testament' },
                  { value: 'others', label: 'Others' }
                ]}
                formLabel="Books"
              />
              <Selector 
                form={form}
                options={[
                  // { value: 'all', label: 'All' },
                  // { value: 'old', label: 'Old Testament' },
                  // { value: 'new', label: 'New Testament' },
                  // { value: 'others', label: 'Others' }
                ]}
                formLabel="Chapters"
              />
            </div>
          </form>
        </Form>
      </div>
    </>
  )
}

export default App
