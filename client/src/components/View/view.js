
import React from 'react';
import { connect } from "react-redux"
import { fetchUser } from "../../actions/userActions"
import { clearCode } from "../../actions/codeActions"

import ReduxView from './reduxView';
import DropTarget from './dropTarget';

@connect((store) => {
  return {
    user: store.user.user,
    userFetched: store.user.fetched,
    tree: store.code.tree,
  };
})
class View extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      componentName: null,
      ID: null,
      counter: 0,
      dropTarget: (
        <div className="col s12">
          <DropTarget handleDroppedComponent={this.handleDroppedComponent.bind(this)} />
        </div>),
      showingOptionsView: false,
      rowObject: {},
    };
    this.handleDroppedComponent = this.handleDroppedComponent.bind(this);
  }

  componentWillMount() {
    this.props.dispatch(fetchUser());
  }

  handleDroppedComponent(droppedInItem, ID, rowObject) {
    var newCount = this.state.counter + 1;
    this.setState({
      componentName: droppedInItem,
      counter: newCount,
      ID: ID,
      rowObject: rowObject,
    });
  }

  render() {
    const { tree } = this.props;

    return (
      <article className="center-content">
          <DropTarget
            handleDrop={this.handleDroppedComponent.bind(this)}
            oldTree={tree}
            dispatch={this.props.dispatch}
            toID="head"

          />
        <ReduxView
          componentState={this.state}
          handleDrop={this.handleDroppedComponent.bind(this)}
        />

      </article>
    );
  }
}

export default View;
