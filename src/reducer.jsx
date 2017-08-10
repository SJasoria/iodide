
import Interpreter from 'js-interpreter'

var INTERPRETER = new Interpreter('')
INTERPRETER.defaultProperties = Object.keys(INTERPRETER.global.properties)
INTERPRETER.declaredProperties = ()=>{ 
	var out = {};
	var declaredProps = Object.keys(INTERPRETER.global.properties)
					.filter(x=> !new Set(INTERPRETER.defaultProperties).has(x))
	declaredProps.forEach((p)=>out[p]=INTERPRETER.global.properties[p])
	return out;
};

function getId(state) {
  return state.cells.reduce((maxId, cell) => {
    return Math.max(cell.id, maxId)
  }, -1) + 1
}

let reducer = function (state, action) {
	switch (action.type) {

		case 'ADD_CELL':
			return Object.assign({}, state, {
				cells: [...state.cells, {
					content: '',
					id: getId(state),
					cellType: action.cellType,
					value: undefined,
					rendered: false
				}]
			});

		case 'CELL_UP':
			var cells = state.cells.slice();
		  	var index = cells.findIndex(c=>c.id===action.id);
		  	if (index > 0) {
		  		var elem = cells[index-1];
		  		cells[index-1] = cells[index];
		  		cells[index] = elem;
		  		var nextState = Object.assign({}, state, {cells});
		  		return nextState;
		  	} else return state;

		case 'CELL_DOWN':
			var cells = state.cells.slice();
		  	var index = cells.findIndex(c=>c.id===action.id);
		  	if (index < cells.length-1) {
		  		var elem = cells[index+1];
		  		cells[index+1] = cells[index];
		  		cells[index] = elem;
		  		var nextState = Object.assign({}, state, {cells});
		  		return nextState;
		  	} else return state;

		case 'UPDATE_CELL':

			var cells = state.cells.slice();

			var index = cells.findIndex(c=>c.id===action.id);
			var thisCell = cells[index];
			
			thisCell.content = action.content;
			cells[index] = thisCell;
			return Object.assign({}, state, {cells})

		case 'RENDER_CELL':

			var declaredProperties = state.declaredProperties;

			var cells = state.cells.slice();
			var index = cells.findIndex(c=>c.id===action.id);
			var thisCell = cells[index];
			if (thisCell.cellType === 'javascript') {
				INTERPRETER.appendCode(thisCell.content);
				INTERPRETER.run();
				thisCell.rendered = true;
				thisCell.value = INTERPRETER.value;
				declaredProperties = INTERPRETER.declaredProperties();
			}
			
			cells[index] = thisCell;
			return Object.assign({}, state, {cells}, {declaredProperties});

		case 'DELETE_CELL':
			return Object.assign({}, state, {
				cells: state.cells.filter((cell)=> {return cell.id !== action.id})
			})

		default:
			return state;
	}
}

export default reducer