import { useState } from 'react'
import './App.css'
import SwitchButton from './components/lib-ui/SwitchButton';
import SearchByScripture from './components/lib-ui/SearchByScripture';
import Spinner from './components/lib-ui/Spinner';
import AllVideos from './components/lib-ui/AllVideos';

function App() {

  const [scripturesSelected, setScripturesSelected] = useState(true)
  const [loading, setLoading] = useState(false)
  return (
    <div className="card">
      <div className='flex justify-center pb-16 gap-4 responsive'>
        <h2 className='text-center text-5xl'>Search By</h2>
        <SwitchButton
          scripturesSelected={scripturesSelected}
          setScripturesSelected={setScripturesSelected}
        />
      </div>
      {loading && <div className='flex justify-center'><Spinner /></div>}
      {scripturesSelected && <SearchByScripture setLoading={setLoading} />}
      {!scripturesSelected && <AllVideos loading={loading} setLoading={setLoading} />}
    </div>
  )
}

export default App
