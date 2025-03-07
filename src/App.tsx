import { useState } from 'react'
import './App.css'

import SwitchButton from './components/lib-ui/SwitchButton';
import SearchByScripture from './components/lib-ui/SearchByScripture';
import Spinner from './components/lib-ui/Spinner';



function App() {

  const [scripturesSelected, setScripturesSelected] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleLoading = (bool: boolean) => {
    setLoading(true)
    setScripturesSelected(bool)
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }

  return (
    <div className="card">
      <div className='flex justify-center pb-16 gap-4 responsive'>
        <h2 className='text-center text-5xl'>Search By</h2>
        <SwitchButton
          scripturesSelected={scripturesSelected}
          setScripturesSelected={handleLoading}
        />
      </div>
      {loading && <div className='flex justify-center'><Spinner /></div>}
      {!loading && scripturesSelected ? <SearchByScripture /> : <></>}
    </div>
  )
}

export default App
