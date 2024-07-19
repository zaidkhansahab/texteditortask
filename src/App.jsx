import { useState, useReducer } from 'react';
import './App.css';

const initialState = {
  texts: [],
  selectedText: null,
  history: [],
  future: [],
};

const ADD_TEXT = 'ADD_TEXT';
const UPDATE_TEXT = 'UPDATE_TEXT';
const SELECT_TEXT = 'SELECT_TEXT';
const DRAG_TEXT = 'DRAG_TEXT';
const UNDO = 'UNDO';
const REDO = 'REDO';

const reducer = (state, action) => {
  switch (action.type) {
    case ADD_TEXT:
      return {
        ...state,
        texts: [...state.texts, action.payload],
        history: [...state.history, { texts: state.texts }],
        future: [],
      };
    case UPDATE_TEXT:
      return {
        ...state,
        texts: state.texts.map(text =>
          text.id === state.selectedText ? { ...text, ...action.payload } : text
        ),
        history: [...state.history, { texts: state.texts }],
        future: [],
      };
    case SELECT_TEXT:
      return { ...state, selectedText: action.payload };
    case DRAG_TEXT:
      return {
        ...state,
        texts: state.texts.map(text =>
          text.id === action.payload.id ? { ...text, x: action.payload.x, y: action.payload.y } : text
        ),
      };
    case UNDO:
      if (state.history.length === 0) return state;
      const previous = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);
      return {
        ...state,
        texts: previous.texts,
        history: newHistory,
        future: [state.texts, ...state.future],
      };
    case REDO:
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        ...state,
        texts: next,
        history: [...state.history, { texts: state.texts }],
        future: newFuture,
      };
    default:
      return state;
  }
};

function App() {
  const [inputText, setInputText] = useState('');
  const [state, dispatch] = useReducer(reducer, initialState);
  const [dragging, setDragging] = useState(false);
  const [draggingTextId, setDraggingTextId] = useState(null);

  const handleInputChange = e => {
    setInputText(e.target.value);
  };

  const addText = () => {
    if (inputText.trim() === '') return;
    const newText = {
      id: Date.now(),
      content: inputText,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      fontSize: 16,
      color: getRandomColor(),
      fontFamily: getRandomFontFamily(),
    };
    dispatch({ type: ADD_TEXT, payload: newText });
    setInputText('');
  };

  const handleTextClick = id => {
    dispatch({ type: SELECT_TEXT, payload: id });
  };

  const handleChange = e => {
    if (!state.selectedText) return;
    const { name, value } = e.target;
    dispatch({ type: UPDATE_TEXT, payload: { [name]: value } });
  };

  const handleMouseDown = (e, id) => {
    setDragging(true);
    setDraggingTextId(id);
  };

  const handleMouseMove = e => {
    if (!dragging) return;
    dispatch({ type: DRAG_TEXT, payload: { id: draggingTextId, x: e.clientX, y: e.clientY } });
  };

  const handleMouseUp = () => {
    setDragging(false);
    setDraggingTextId(null);
  };

  const undo = () => {
    dispatch({ type: UNDO });
  };

  const redo = () => {
    dispatch({ type: REDO });
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const getRandomFontFamily = () => {
    const fonts = ['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana'];
    return fonts[Math.floor(Math.random() * fonts.length)];
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col lg:flex-row" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <div className="flex flex-col lg:w-1/5 mb-4 lg:mb-0">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Enter your text"
          className="p-2 border rounded mb-4"
        />
        <button onClick={addText} className="p-2 bg-blue-500 text-white rounded mb-4">Add Text</button>
        <button onClick={undo} className="p-2 bg-yellow-500 text-white rounded mb-4">Undo</button>
        <button onClick={redo} className="p-2 bg-green-500 text-white rounded">Redo</button>
      </div>
      <div className="relative flex-1 border rounded-md bg-white p-4 overflow-hidden">
        {state.texts.map(text => (
          <div
            key={text.id}
            className="absolute cursor-move"
            style={{
              left: text.x,
              top: text.y,
              fontSize: `${text.fontSize}px`,
              color: text.color,
              fontFamily: text.fontFamily,
            }}
            onMouseDown={e => handleMouseDown(e, text.id)}
            onMouseUp={handleMouseUp}
            onClick={() => handleTextClick(text.id)}
          >
            {text.content}
          </div>
        ))}
      </div>
      {state.selectedText && (
        <div className="flex flex-col mt-4 lg:mt-0 lg:w-1/5">
          <label className="block mb-2">
            Font Size:
            <input
              type="number"
              name="fontSize"
              value={state.texts.find(text => text.id === state.selectedText).fontSize}
              onChange={handleChange}
              className="ml-2 p-1 border rounded w-full"
            />
          </label>
          <label className="block mb-2">
            Color:
            <input
              type="color"
              name="color"
              value={state.texts.find(text => text.id === state.selectedText).color}
              onChange={handleChange}
              className="ml-2 p-1 border rounded w-full"
            />
          </label>
          <label className="block mb-2">
            Font Family:
            <select
              name="fontFamily"
              value={state.texts.find(text => text.id === state.selectedText).fontFamily}
              onChange={handleChange}
              className="ml-2 p-1 border rounded w-full"
            >
              <option value="Arial">Arial</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Verdana">Verdana</option>
            </select>
          </label>
          <label className="block mb-2">
            Content:
            <input
              type="text"
              name="content"
              value={state.texts.find(text => text.id === state.selectedText).content}
              onChange={handleChange}
              className="ml-2 p-1 border rounded w-full"
            />
          </label>
        </div>
      )}
    </div>
  );
}

export default App;
