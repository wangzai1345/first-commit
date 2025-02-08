 import  {useState,useEffect } from 'react'

 function Test(){
    
    const [b,setB] = useState(100)

    useEffect(()=>{
        console.log('useEffect jinitaimei')
    },[b])//依赖数组：空的时候，在创建页面时执行函数；无则每一次渲染都会执行该函数；有依赖项则在依赖项改变的时候执行函数

    let arr = [1,2,3]

    const [count,setCount] = useState(1)//1是初始值,count是变量名，setcount是函数的方法，这个函数在9行解释为加1
    function add(){
      setCount(count + 1)
    }//add为这个函数

    
    return (

/*         <>
        <div>
         <h1>Test</h1>
        </div>
        </> */

       <>
      
       <div>
          {count}
       </div>
       <button onClick={add}>点我a+1</button>
       <button onClick={()=> setB(b+1)}>点我b+1</button>
       
       </>
       
    ); 
 }
 export default Test;//已听1h