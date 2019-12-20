/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Typography, Card, Tag, Popover, Dropdown, Button, Icon, Pagination,Input
} from 'antd';
import {
  cloneDeep,
} from 'lodash';
import IconKit from 'react-icons-kit';
import {
  ic_cancel, /* eslint-disable-line */
} from 'react-icons-kit/md';

import style from '../term.module.scss';

export const INSTRUCTION_TYPE_FILTER = 'filter';
export const FILTER_TYPE_GENERIC = 'generic';
export const FILTER_TYPE_NUMERICAL_COMPARISON = 'numcomparison';
export const FILTER_TYPE_COMPOSITE = 'composite';
export const FILTER_TYPE_GENERICBOOL = 'genericbool';
export const FILTER_TYPE_SPECIFIC = 'specific';
export const FILTER_TYPES = [FILTER_TYPE_GENERIC, FILTER_TYPE_NUMERICAL_COMPARISON, FILTER_TYPE_COMPOSITE, FILTER_TYPE_SPECIFIC];

export const createFilter = type => ({
  type: INSTRUCTION_TYPE_FILTER,
  data: {
    type: (FILTER_TYPES.indexOf(type) !== -1 ? type : FILTER_TYPE_GENERIC),
  },
});

class Filter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSet: null,
      visible: null,
      selected: null,
      opened: null,
      allOptions: [],
      size: null,
      page: null,
    };

    this.isEditable = this.isEditable.bind(this);
    this.isRemovable = this.isRemovable.bind(this);
    this.isSelectable = this.isSelectable.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.isOpened = this.isOpened.bind(this);
    this.isVisible = this.isVisible.bind(this);
    this.serialize = this.serialize.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleApply = this.handleApply.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleSearchByQuery = this.handleSearchByQuery.bind(this)

    // @NOTE Initialize Component State
    const { dataSet, autoOpen, autoSelect, visible, sortData } = props;
    this.state.dataSet = dataSet || [];
    this.state.opened = autoOpen;
    this.state.visible = visible;
    this.state.selected = autoSelect;
    this.state.allOptions = cloneDeep(sortData);
    this.state.page = 1;
    this.state.size = 10;
  }

  isEditable() {
    const { options } = this.props;
    const { editable } = options;
    return editable === true;
  }

  isSelectable() {
    const { options } = this.props;
    const { selectable } = options;
    return selectable === true;
  }

  isRemovable() {
    const { options } = this.props;
    const { removable } = options;
    return removable === true;
  }

  isVisible() {
    const { visible } = this.state;
    return visible === true;
  }

  isSelected() {
    const { selected } = this.state;
    return selected === true;
  }

  isOpened() {
    const { opened } = this.state;
    return opened === true;
  }

  serialize() {
    return Object.assign({}, this.props, this.state);
  }

  handleClose(force = false) {
    if (force === true || this.isRemovable()) {
      const { onRemoveCallback } = this.props;
      this.setState({
        opened: false,
        visible: false,
      }, () => {
        onRemoveCallback(this.serialize());
      });
    }
  }

  // @NOTE Refactor this; logic should be moved within the class for the selected filter type
  handleApply() {
    if (this.isEditable()) {
      const { editor, onEditCallback, data, type, index } = this.props;
      const { id } = data;
      let instruction = { id, type, index };

      this.setState({
        opened: false,
      }, () => {
        onEditCallback(instruction);
      });

      if (type === FILTER_TYPE_GENERIC) {
        instruction.values = editor.props.children[4].props.children.props.children.props.value;
        instruction.operand = editor.props.children[0].props.children.props.children.props.value;
        if (instruction.values.length === 0) {
          this.handleClose(true);
        }
      } else if (type === FILTER_TYPE_SPECIFIC) {
        instruction.operand = editor.props.children[0].props.children.props.children.props.value;
        instruction.values = editor.props.children[3].props.children.props.children.props.value;
        if (instruction.values.length === 0) {
          this.handleClose(true);
        }
      } else if (type === FILTER_TYPE_NUMERICAL_COMPARISON) {
        instruction.comparator = editor.props.children[0].props.children.props.children.props.value;
        instruction.value = editor.props.children[2].props.children[1].props.children.props.defaultValue;
      } else if (type === FILTER_TYPE_GENERICBOOL) {
        instruction.values = editor.props.children[2].props.children.props.children.props.value
      } else if (type === FILTER_TYPE_COMPOSITE) {
        const quality = editor.props.children.props.children[1] ? editor.props.children.props.children[1].props.children.props.value : null;
        const comparator = editor.props.children.props.children[2] ? editor.props.children.props.children[2].props.children.props.value : null;
        const score = editor.props.children.props.children[3] ? editor.props.children.props.children[3].props.children.props.value : null;
        if (comparator) {
          instruction.comparator = comparator;
          instruction.value = score;
        } else {
          delete instruction.comparator;
          instruction.value = quality;
        }
      }


   }
  }

  handleCancel() {
    const { onCancelCallback } = this.props;
    this.setState({
      opened: false,
    }, () => {
      onCancelCallback(this.serialize());
    });
  }

  handleSelect() {
    if (this.isSelectable() && !this.isOpened()) {
      const { onSelectCallback } = this.props;
      this.setState({
        selected: !this.isSelected(),
      }, () => {
        onSelectCallback(this.serialize());
      });
    }
  }

  toggleMenu() {
    this.setState({ opened: !this.isOpened() });
  }

  handlePageChange(page, size) {
    const { onPageChangeCallBack } = this.props;
    this.setState({
      page,
      size,
    }, () => {
      onPageChangeCallBack(page, size);
    });
  }

  handleSearchByQuery(value){
      const { onSearchCallback } = this.props;
      const search = value.target.value
      onSearchCallback(search);
  }

  render() {
    const { allOptions, size, page, selected } = this.state;
    const { data, intl, overlayOnly, editor, label, legend, content, dataSet, searchable, autoSelect } = this.props;
    let titleText = intl.formatMessage({ id: 'screen.patientvariant.filter_'+data.id });
    const descriptionText = intl.formatMessage({ id: 'screen.patientvariant.filter_'+data.id+'.description'});
    let operandText = ""
    const filterSearch = intl.formatMessage({ id: 'screen.patientvariant.filter.search' });
    let values = []
    if(data.type === "generic" || data.type === "specific"){
        values = data.values
        operandText = intl.formatMessage({ id: `screen.patientvariant.filter.operand.${data.operand}` });
    }
    else if(data.type === "numcomparison"){
        values.push(data.value)
        operandText = data.comparator;
    }
    else if(data.type ==="genericbool"){
        values = data.values
    }
    else if(data.type ==="composite"){
        values.push(data.value)
        operandText=data.comparator;
    }


    const overlay = (
      <Popover
        visible={this.isOpened()}
      >
        <Card className="filterCard">
          <Typography.Title level={4}>{titleText}</Typography.Title>
          <Typography>{descriptionText}</Typography>
          <br />
          {searchable && (
               <>
               <Row>
                 <Input
                   allowClear
                   placeholder={filterSearch}
                   size="small"
                   onChange={this.handleSearchByQuery}
                 />
               </Row>
               <br/>
               </>
          )
          }
          { editor }
          { allOptions  && (
                allOptions.length >= size
                  ? (
                    <Row style={{ marginTop: 'auto' }}>
                      <br />
                      <Col align="end" span={24}>
                        <Pagination
                          total={allOptions.length}
                          pageSize={size}
                          current={page}
                          pageSizeOptions={['10', '25', '50', '100']}
                          onChange={this.handlePageChange}
                        />
                      </Col>
                    </Row>
                  ) : null
          )
          }

          <br />
          <Row type="flex" justify="end" style={dataSet.length < 10 ? { marginTop: 'auto' } : null}>
            <Col>
              <Button onClick={this.handleCancel}>Annuler</Button>
            </Col>
            <Col>
              <Button style={{ marginLeft: '8px' }} type="primary" onClick={this.handleApply}>Appliquer</Button>
            </Col>
          </Row>
        </Card>
      </Popover>
    );

    if (overlayOnly === true) {
      return (
        <Dropdown
          trigger="click"
          onVisibleChange={this.toggleMenu}
          overlay={overlay}
          visible={this.isOpened()}
          placement="bottomLeft"
        >
          <span />
        </Dropdown>
      );
    }
    return (
      <span>
        <Tag
          visible={this.isVisible()}
          onClose={this.handleClose}
          color={autoSelect? '#b5e6f7' : '#d1deea'}
          className={autoSelect? `${style.tag} ${style.selectedTag}` : `${style.tag} `}
        >
          <Tag
            color={autoSelect? '#e2f5fc' : '#E9EFF5 '}
            className={`${style.insideTag}`}
          >
            { titleText }
          </Tag>
          {operandText ?
              <Tag
                color={autoSelect? '#b5e6f7' : '#d1deea'}
                className={`${style.insideTag} ${style.operator}`}
              >
                {operandText}
              </Tag>

            : null
          }
          { this.isEditable() && (
          <Dropdown
            trigger="click"
            onVisibleChange={this.toggleMenu}
            overlay={overlay}
            visible={this.isOpened()}
            placement="bottomLeft"
          >
            <Tag
              onClick={this.toggleMenu}
              color="#FFFFFF"
              className={`${style.insideTag }`}
            >
                  {values.map((label, index) =>
                  <>
                  {index !==0 ? ' • '  : null
                  }
                  {label}
                  </>
                  )}
            </Tag>
          </Dropdown>
          ) }
          {autoSelect?  <IconKit  className={`${style.closingIcon}`}  onClick={this.handleClose}size={16} icon={ic_cancel} /> : null}
        </Tag>
      </span>
    );
  }
}

Filter.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  data: PropTypes.shape({}).isRequired,
  dataSet: PropTypes.array.isRequired,
  type:PropTypes.string.isRequired,
  options: PropTypes.shape({}),
  onCancelCallback: PropTypes.func,
  onEditCallback: PropTypes.func,
  onRemoveCallback: PropTypes.func,
  onSelectCallback: PropTypes.func,
  editor: PropTypes.shape({}).isRequired,
  label: PropTypes.string,
  legend: PropTypes.shape({}).isRequired,
  content: PropTypes.shape({}).isRequired,
  autoOpen: PropTypes.bool,
  overlayOnly: PropTypes.bool,
  visible: PropTypes.bool,
  sortData: PropTypes.array,
};

Filter.defaultProps = {
  options: {
    editable: false,
    selectable: false,
    removable: false,
  },
  onCancelCallback: () => {},
  onEditCallback: () => {},
  onRemoveCallback: () => {},
  onSelectCallback: () => {},
  label: '',
  autoOpen: false,
  autoSelect: false,
  overlayOnly: false,
  visible: true,
  sortData:[]
};

export default Filter;
