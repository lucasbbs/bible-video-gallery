import { useState } from 'react'
import SwitchButton from './SwitchButton'
import Spinner from './Spinner'
import SearchByScripture from './SearchByScripture'
import AllVideos from './AllVideos'

function Pages() {
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
    {!loading && scripturesSelected ? <SearchByScripture /> : <AllVideos />}
  </div>

  )
}

export default Pages