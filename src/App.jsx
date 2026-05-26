import { useState, useEffect, useMemo } from 'react'

// Issue 1: Inline API key (security issue)
// ✨move API_KEY to .env -> use import.meta.env for vite
const API_KEY = import.meta.env.VITE_API_KEY

function App() {
  // Issue 2: State management bisa lebih baik
  const [todos, setTodos] = useState([])
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all')
  
  // Issue 3: useEffect tanpa dependency array yang tepat
  //✨ handling error JSON parse
  useEffect(() => {
    try {
      const saved = localStorage.getItem('todos')

      if (saved) {
        setTodos(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load todos', error)
    }
  }, [])
  
  // Issue 4: useEffect yang terlalu sering run
  //✨ add dependency : todos
  useEffect(()=>{
    localStorage.setItem('todos', JSON.stringify(todos))
  },[todos])
  
  // Issue 5: Function yang tidak di-memoize, re-create setiap render
  const addTodo = () => {
    if (input.trim() === '') {
      alert('Please enter a todo')
      return
    }
    
    // Issue 6: Menggunakan Date.now() sebagai ID (bisa collision)
    //✨use UUID
    const newTodo = {
      id: crypto.randomUUID(),
      text: input,
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    setTodos([...todos, newTodo])
    
    setInput('')
  }
  
  // Issue 7: Tidak ada error handling
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
    
  }
  
  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }
  
  // ✨ Issue 8: Logic filtering yang bisa dipindah ke useMemo
  const getFilteredTodos = useMemo(()=>{
    if (filter === 'active') {
      return todos.filter(todo => !todo.completed)
    }
    if (filter === 'completed') {
      return todos.filter(todo => todo.completed)
    }
    return todos
  },[todos, filter])
  
  // Issue 9: Calculation yang tidak perlu di setiap render
  // ✨ useMemo for calculation -> only runs when todos changes
  const stats = useMemo(() => {
    return {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      active: todos.filter(t => !t.completed).length
    }
  }, [todos])

  const handleEnter = (e)=> {
  if (e.key === 'Enter') {
      addTodo()
    }
  }
    
  // Issue 10: Inline event handler dengan arrow function (re-create setiap render)
  // ✨ move Inline event handler to function
  return (
    <div className="app">
      <h1>My Todo List</h1>
      
      {/* ✨ Issue 11: Tidak ada label untuk accessibility */}
      <div className="input-section">
        <label htmlFor="todo-input">To Do :</label>
        <input 
          id="todo-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleEnter}
          placeholder="What needs to be done?"
        />
        <button onClick={addTodo}>Add</button>
      </div>
      
      {/* Issue 12: Inline styles (inconsistent dengan CSS file) */}
      {/* ✨move all style to CSS file */}
      <div className='button-grup-style'>
        <button 
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'btn-active' : 'btn'}
        >
          All To Do
        </button>
        <button 
          onClick={() => setFilter('active')}
          className={filter === 'active' ? 'btn-active' : 'btn'}
        >
          Active To Do
        </button>
        <button 
          onClick={() => setFilter('completed')}
          className={filter === 'completed' ? 'btn-active' : 'btn'}
        >
          Completed To Do
        </button>
      </div>
      
      <div className='todo-list'>
        {/* Issue 13: Tidak ada handling untuk empty state */}
        {/* ✨add condition : length must be > 0 to render todos*/}
        {getFilteredTodos.length==0 && <p>Nothing to do</p>}
        {getFilteredTodos.length > 0  && getFilteredTodos.map((todo) => (
          // ✨Issue 14: Key menggunakan index bisa lebih baik dengan ID
          <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <input 
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            {/* Issue 15: Potential XSS jika text dari user input */}
            {/* ✨using {} -> JavaScript expression in JSX*/}
            <span>{todo.text}</span>

            <button 
              className="delete-btn"
              onClick={() => deleteTodo(todo.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      
      <div className="stats">
        <p>Total: {stats.total} | Active: {stats.active} | Completed: {stats.completed}</p>
      </div>
      
      {/* Issue 16: Debug code yang tertinggal */}
      {console.log('Rendering with todos:', todos)}
    </div>
  )
}

export default App
