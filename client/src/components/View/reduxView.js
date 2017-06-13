import React from 'react';
import { connect } from 'react-redux';
import { updateTree } from '../../actions/codeActions';
import dragItems from '../../dragItems';
import Tree from '../../dataStructure/tree';
import linkers from '../../dataStructure/linkedList';
import _ from 'lodash';
import DropTarget from './dropTarget';
import shortid from 'shortid';
import Items from './items'

const styles = {
  bottomUp: {
    margin: '-2% 0',
  },
};

@connect((store) => {
  return {
    tree: store.code.tree,
    item: store.code.item,
    currentRowObject: store.code.currentRowObject,
  };
})
class reduxView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ID: null,
      dropTarget: (
        <div className="col s12" id={shortid.generate()}>
          <DropTarget handleDrop={this.handleDroppedComponent.bind(this)} context={this} />
        </div>),
      rowObject: this.props.tree.rowObject,
    };
    this.handleDroppedComponent = this.handleDroppedComponent.bind(this);
  }

  handleDroppedComponent(droppedInItem, ID, rowObject) {
    this.props.handleDrop(droppedInItem, ID, rowObject);
  }

  componentWillReceiveProps(nextProps) {
    var componentName = nextProps.componentState.componentName;
    var uniqueID = nextProps.componentState.ID;
    var rowObject = nextProps.componentState.rowObject || {
      linkedList: {},
      head: null,
      tail: null,
      renderLinkedList: [],
    };
    var isRow = false;
    var isUpdateRowObject = false;

    if (_.startsWith(componentName, 'rowCol')) {
      var colNum = componentName.slice(6);
      isRow = true;
      for (var i = 0; i < colNum; i++) {
        var key = 'dnd' + i;
        rowObject = linkers.addToTail(
          rowObject.linkedList,
          false,
          key,
          rowObject.head,
          rowObject.tail);
      }
    } else if (_.startsWith(uniqueID, 'dnd')) {
      isRow = true;
      var index = uniqueID[3];
      var newKey = 'col' + index;
      var dndToCompkey = uniqueID.slice(0, 4);
      uniqueID = uniqueID.slice(4);

      rowObject = linkers.replaceNode(
        rowObject,
        dragItems[componentName],
        dndToCompkey,
        rowObject.head,
        rowObject.tail,
        newKey
      )

      isUpdateRowObject = true;

    }

    if (nextProps.componentState.counter !== this.props.componentState.counter) {
      if (Object.keys(this.props.tree).length === 0) {
        var tree = new Tree(
          dragItems[componentName],
          rowObject,
          isRow
        );
        this.props.dispatch(updateTree(tree));
      } else if (uniqueID === 'head') {
        var tree = this.props.tree;
        tree = tree.pushToHead(
          dragItems[componentName],
          rowObject,
          isRow
        );
        this.props.dispatch(updateTree(tree));
      } else if (isUpdateRowObject) {
        var tree  = this.props.tree;
        tree.updateRowObject(
          uniqueID,
          tree.traverseBF,
          rowObject
        );
        this.props.dispatch(updateTree(tree));
      } else {
        var tree = this.props.tree;
        tree.add(
          dragItems[componentName],
          uniqueID,
          tree.traverseBF,
          rowObject,
          isRow
        );
        this.props.dispatch(updateTree(tree));
      }
    }

  }

  render() {
    const { tree } = this.props;

    var treeArray = [];
    var colObject = {1: 12, 2: 6, 3: 4, 4: 3, 12: 1};
    var renderLinkedList = [];

    if (Object.keys(this.props.tree).length > 0) {
      var treeObject = tree.traverseRendering();
    }


    _.forEach(treeObject, (node) => {

      if (node.isRow) {

        var colNum = colObject[Object.keys(node.rowObject.linkedList).length];
        var colClass = `col s${colNum}`;
        var saveRowObject = node.rowObject;

        var current = node.rowObject.linkedList[node.rowObject.head.key];
        node.rowObject.renderLinkedList = [];
        while (current) { // while not null

            if (_.startsWith(current.key, 'dnd')) {
              var newToID = current.key + node.ID;
              node.rowObject.renderLinkedList.push(
              <div className={colClass} key={current.key}>
                <DropTarget
                  handleDrop={this.handleDroppedComponent.bind(this)}
                  toID={newToID}
                  oldTree={tree}
                  rowObject={node.rowObject}
                />
              </div>);
            } else {
              node.rowObject.renderLinkedList.push(
                <div className={colClass} key={current.key}>
                  {current.component}
                </div>
              );
            }

            current = node.rowObject.linkedList[current.next];
        }

      }

      treeArray.push(node);

    });

    const treeMap = _.map(treeArray, (node, index) => (
      <div key={index}>
        <div className="row">
          { node.isRow ?
            node.rowObject.renderLinkedList.map((col) => col) :
            <div>{node.component}</div>
          }
        </div>
        <div className="col s12" id={node.ID}>
            <DropTarget
            handleDrop={this.handleDroppedComponent.bind(this)}
            toID={node.ID}
            oldTree={tree}
            />
        </div>
      </div>));

    return (
      <div style={styles.bottomUp}>
        <Items items={treeMap} toggleoptionview={this.props.toggleoptionview} />
      </div>
    );
  }
}

export default reduxView;
