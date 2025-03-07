
type SwitchButtonProps = {
    scripturesSelected: boolean
    setScripturesSelected: (value: boolean) => void
}

export default function SwitchButton({ scripturesSelected, setScripturesSelected }: SwitchButtonProps) {
    return (
        <div className="self-center flex justify-between w-fit bg-gray-200 rounded-full mx-4 cursor-pointer ">
            <div
                onClick={() => setScripturesSelected(true)}
                className={`text-center p-4 rounded-full w-40 transition duration-300 ${scripturesSelected ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}>
                Scripture
            </div>
            <div
                onClick={() => setScripturesSelected(false)}
                className={`text-center p-4 rounded-full w-40 transition duration-300 ${scripturesSelected ? 'bg-gray-200 text-black' : 'bg-black text-white'}`}>
                All Videos
            </div>
        </div>
    )
}
