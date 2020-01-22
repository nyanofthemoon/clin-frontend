/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Menu, Button, Checkbox, Tooltip, Dropdown, Icon, Modal, Row, Divider, Input,Popconfirm
} from 'antd';
import {
  cloneDeep, find, findIndex, pull, pullAllBy, filter, isEmpty, isEqual, every, remove, first,
} from 'lodash';
import uuidv1 from 'uuid/v1';
import DragSortableList from 'react-drag-sortable';
import IconKit from 'react-icons-kit';
import {
  software_pathfinder_intersect, software_pathfinder_unite, software_pathfinder_subtract,
} from 'react-icons-kit/linea';
import {
  ic_folder, ic_delete, ic_content_copy, ic_save, ic_note_add, ic_share, ic_unfold_more, ic_edit,
} from 'react-icons-kit/md';
import Query from './index';
import {
  createSubqueryInstruction, INSTRUCTION_TYPE_SUBQUERY,
} from './Subquery';
import {
  createOperatorInstruction, getSvgPathFromOperatorType, OPERATOR_TYPE_AND, OPERATOR_TYPE_OR, OPERATOR_TYPE_AND_NOT,
} from './Operator';

import './statement.scss';
import styleStatement from './statement.module.scss';


class Statement extends React.Component {
  constructor(props) {
    super(props);
    const {
      data, display, original,
    } = props;
    this.state = {
      original: cloneDeep(original),
      checkedQueries: [],
      queriesChecksAreIndeterminate: false,
      queriesAreAllChecked: false,
      display: cloneDeep(data).map(() => ({ ...display })),
      visible: false,
      expandIconPosition: 'left',
      statementTitle: null,
      saveTitleModalInputValue: '',
      saveTitleModalVisible: false,
      statementVisualClueText: '',
      originalTitle: '',
      options: {
        copyable: null,
        duplicatable: null,
        editable: null,
        removable: null,
        reorderable: null,
        selectable: null,
        undoable: null,
      },
      dropDownIsOpen: false,
      onFocus:false,
      popConfirmDropDownNewIsOpen:false,
      popConfirmDropDownIsOpen:false,
    };
    this.isCopyable = this.isCopyable.bind(this);
    this.isEditable = this.isEditable.bind(this);
    this.isDuplicatable = this.isDuplicatable.bind(this);
    this.isRemovable = this.isRemovable.bind(this);
    this.isReorderable = this.isReorderable.bind(this);
    this.isSelectable = this.isSelectable.bind(this);
    this.isUndoable = this.isUndoable.bind(this);
    this.isDirty = this.isDirty.bind(this);
    this.actionIsDisabled = this.actionIsDisabled.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDisplay = this.handleDisplay.bind(this);
    this.handleDuplicate = this.handleDuplicate.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.confirmRemoveChecked = this.confirmRemoveChecked.bind(this);
    this.confirmRemove = this.confirmRemove.bind(this);
    this.getSubqueryKeys = this.getSubqueryKeys.bind(this);
    this.showDeleteConfirm = this.showDeleteConfirm.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleReorder = this.handleReorder.bind(this);
    this.handleUndo = this.handleUndo.bind(this);
    this.handleCheckQuery = this.handleCheckQuery.bind(this);
    this.handleCheckAllQueries = this.handleCheckAllQueries.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleRemoveChecked = this.handleRemoveChecked.bind(this);
    this.handleNewQuery = this.handleNewQuery.bind(this);
    this.handleCombine = this.handleCombine.bind(this);
    this.findQueryIndexForKey = this.findQueryIndexForKey.bind(this);
    this.findQueryTitle = this.findQueryTitle.bind(this);
    this.getStatements = this.getStatements.bind(this);
    this.onModalSaveTitleInputChange = this.onModalSaveTitleInputChange.bind(this);
    this.createDraftStatement = this.createDraftStatement.bind(this);
    this.duplicateStatement = this.duplicateStatement.bind(this);
    this.updateStatement = this.updateStatement.bind(this);
    this.setStatementAsDefault = this.setStatementAsDefault.bind(this);
    this.deleteStatement = this.deleteStatement.bind(this);
    this.selectStatement = this.selectStatement.bind(this);
    this.onPositionChange = this.onPositionChange.bind(this);
    this.onStatementTitleChange = this.onStatementTitleChange.bind(this);
    this.onStatementTitleChangeEnter =this.onStatementTitleChangeEnter.bind(this)
    this.handleCancelModal = this.handleCancelModal.bind(this);
    this.showConfirmForDestructiveStatementAction = this.showConfirmForDestructiveStatementAction.bind(this);
    this.getTitleWidth = this.getTitleWidth.bind(this);
    this.handleFocus =this.handleFocus.bind(this)
    this.onFocusTitle=this.onFocusTitle.bind(this)
    this.onBlurTitle = this.onBlurTitle.bind(this);
    this.onBlurDropdown= this.onBlurDropdown.bind(this)
    this.handleFocusDropdown = this.handleFocusDropdown.bind(this)
    this.deleteDropDown = this.deleteDropDown.bind(this)
    this.onCancel= this.onCancel.bind(this)
    this.test = this.test.bind(this)

  }

  isCopyable() {
    const { options } = this.props;
    const { copyable } = options;
    return copyable === true;
  }

  isDuplicatable() {
    const { options } = this.props;
    const { duplicatable } = options;
    return duplicatable === true;
  }

  isEditable() {
    const { options } = this.props;
    const { editable } = options;
    return editable === true;
  }

  isRemovable() {
    const { options } = this.props;
    const { removable } = options;
    return removable === true;
  }

  isReorderable() {
    const { options } = this.props;
    const { reorderable } = options;
    return reorderable === true;
  }

  isSelectable() {
    const { options } = this.props;
    const { selectable } = options;
    return selectable === true;
  }

  isUndoable() {
    const { options } = this.props;
    const { undoable } = options;
    return undoable === true;
  }

  isDirty() {
    const activeStatement = this.props.statements[this.props.activeStatementId];
    const activeStatementHasSingleEmptyQuery = this.props.data.length === 1 && this.props.data[0].instructions.length === 0
    const statementIsDraft = !activeStatement || this.props.activeStatementId === 'draft';

    const titleHasChanges = this.state.statementTitle !== null && this.state.statementTitle !== activeStatement.title
    const queriesHaveChanges = statementIsDraft ? !activeStatementHasSingleEmptyQuery : !isEqual(this.props.data, this.props.original)

    return (titleHasChanges === true) || (queriesHaveChanges === true)
  }

  actionIsDisabled(action) {
    const activeStatement = this.props.statements[this.props.activeStatementId];
    const statementIsDraft = !activeStatement || this.props.activeStatementId === 'draft';
    switch (action) {
      case 'new':
        return (statementIsDraft && (this.props.data.length === 1 && this.props.data[0].instructions.length === 0))
      case 'save':
        return !this.isDirty()
      case 'duplicate':
        return statementIsDraft;
      case 'delete':
        return statementIsDraft;
      case 'share':
        return true
    }

    return false;
  }

  handleCopy() {
    if (this.isCopyable()) {
      return true;
    }
  }

  handleClick(key) {
    const { activeQuery, onSelectCallback } = this.props;
    const isActive = activeQuery === key;
    if (!isActive) {
      onSelectCallback(key);
    }
  }

  handleEdit(query) {
    if (this.isEditable()) {
      const { onEditCallback } = this.props;
      onEditCallback(query);
    }
  }

  handleDisplay(config) {
    const { display } = this.state;
    const updatedDisplayList = [
      ...display,
    ];
    updatedDisplayList[config.index] = config.display;
    this.setState({
      display: updatedDisplayList,
    });
  }

  showConfirmForDestructiveStatementAction(title, content, okText = 'Ok', cancelText = 'Cancel', funcToCallBack) {
    Modal.confirm({
      title,
      content,
      okText,
      cancelText,
      onOk() { funcToCallBack(); },
      onCancel() {},
    });
  }

  handleDuplicate(query) {
    if (this.isDuplicatable()) {
      const { onDuplicateCallback } = this.props;
      const { display } = this.state;
      const index = query.index + 1;
      const clone = cloneDeep(query);
      clone.data.key = uuidv1();
      const displayClone = cloneDeep(display);
      const howDisplayed = this.state.display[query.index];
      displayClone.splice(index, 0, howDisplayed);
      this.setState({
        display: displayClone,
        statementVisualClueText: this.props.intl.formatMessage({ id: 'screen.patientvariant.statementVisualClue.modification.text' }),
      }, () => {
        onDuplicateCallback(clone, index);
      });
    }
  }

  handleRemove(key) {
    if (this.isRemovable()) {
      const subqueryKeys = this.getSubqueryKeys([key]);
      if (!isEmpty(subqueryKeys)) {
        this.showDeleteConfirm([key]);
      } else {
        this.confirmRemove([key]);
      }
    }
  }

  getStatements() {
    this.props.onGetStatementsCallback();
  }

  createDraftStatement() {
    const callbackCreateDraft = () => {
      this.setState({
        statementTitle: null,
        statementVisualClueText: this.props.intl.formatMessage({ id: 'screen.patientvariant.statementVisualClue.modification.text' }),
      }, () => {
        this.props.onCreateDraftStatementCallback();
      });
    };

    if (this.isDirty()) {
      this.showConfirmForDestructiveStatementAction(
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmDraft.modal.title' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmDraft.modal.content' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmDraft.modal.ok' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmDraft.modal.cancel' }),
        callbackCreateDraft,
      );
    } else {
      callbackCreateDraft();
    }
  }

  duplicateStatement(e) {
    let id = e.currentTarget ? e.currentTarget.getAttribute('dataid') : e;
    if (!id) {
      const { activeStatementId } = this.props;
      id = activeStatementId;
    }
    if (e.stopPropagation) { e.stopPropagation(); }
    const callbackDuplicate = () => {
      this.setState({
        statementTitle: null,
        statementVisualClueText: this.props.intl.formatMessage({ id: 'screen.patientvariant.statementVisualClue.modification.text' }),
      });
      this.props.onDuplicateStatementCallback(id);
    };
    if (this.isDirty()) {
      this.showConfirmForDestructiveStatementAction(
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmDuplicate.modal.title' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmDuplicate.modal.content' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmDuplicate.modal.ok' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmDuplicate.modal.cancel' }),
        callbackDuplicate,
      );
    } else {
      callbackDuplicate();
    }
  }

  updateStatement(e) {
    let id = e.target ? e.target.getAttribute('dataid') : e;
    if (!id) {
      id = this.props.activeStatementId;
    }

    this.props.onUpdateStatementCallback(id, this.state.statementTitle, '', this.props.data, false);
    if (e.stopPropagation) { e.stopPropagation(); }
  }

  setStatementAsDefault(e) {
    let id = e.currentTarget ? e.currentTarget.getAttribute('dataid') : e;
    if (!id) {
      const { activeStatementId } = this.props;
      id = activeStatementId;
    }
    const title = this.state.statementTitle !== null ? this.state.statementTitle : this.props.statements[id].title;
    const callbackSetStatementAsDefault = () => {
      this.setState({
        statementVisualClueText: '',
      });
      this.props.onUpdateStatementCallback(id, title, '', null, true);
    };
    if (this.isDirty()) {
      this.showConfirmForDestructiveStatementAction(
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmLoss.modal.title' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmLoss.modal.content' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmLoss.modal.ok' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmLoss.modal.cancel' }),
        callbackSetStatementAsDefault,
      );
    } else {
      callbackSetStatementAsDefault();
    }
    if (e.stopPropagation) { e.stopPropagation(); }
  }

  deleteStatement(e) {
    let id = e.currentTarget ? e.currentTarget.getAttribute('dataid') : e;
    console.log("id", id)
    if (!id) {
      const { activeStatementId } = this.props;
      id = activeStatementId;
      this.setState({
        statementTitle: null,
        statementVisualClueText: '',
      });
    }

    this.props.onDeleteStatementCallback(id);
    e.stopPropagation();
  }

  selectStatement(e) {
    console.log("bedon")
    console.log("e", e)
    let id = e.target ? e.target.getAttribute('dataid') : e;
    console.log("id", id)
    const {popConfirmDropDownIsOpen, popConfirmDropDownNewIsOpen} = this.state
    if (!id) {
      const { activeStatementId } = this.props;
      id = activeStatementId;
    }
    const callbackSelect = () => {
      console.log("callBacSelect")
      this.setState({
        statementTitle: null,
        statementVisualClueText: '',
      });
      this.props.onSelectStatementCallback(id);
    };
    if (this.isDirty()) {
      this.showConfirmForDestructiveStatementAction(
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmSelect.modal.title' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmSelect.modal.content' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmSelect.modal.ok' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmSelect.modal.cancel' }),
        callbackSelect,
      );
    } else {
      callbackSelect();
    }



  }

  confirmRemove(keys) {
    this.props.onRemoveCallback(keys);
  }

  handleReorder(sorted) {
    if (this.isReorderable() && !isEmpty(sorted)) {
      const { display } = this.state;
      const { onSortCallback, data } = this.props;
      const sortedIndices = sorted.map(clip => clip.index);
      const sortedData = sortedIndices.map(sortedIndice => data[sortedIndice]);
      const sortedDisplay = sortedIndices.map(sortedIndice => display[sortedIndice]);
      this.setState({
        display: sortedDisplay,
        statementVisualClueText: this.props.intl.formatMessage({ id: 'screen.patientvariant.statementVisualClue.modification.text' }),
      }, () => {
        onSortCallback(sortedData);
      });
    }
  }

  handleSelect(item) {
    if (this.isSelectable()) {
      return true;
    }
  }

  handleUndo() {
    if (this.isUndoable()) {
      this.props.onDraftHistoryUndoCallback();
    }
  }

  handleCheckQuery(e) {
    const { data } = this.props;
    const { checkedQueries } = this.state;
    const { target } = e;
    const { value, checked } = target;
    if (!checked) {
      pull(checkedQueries, value);
    } else {
      if (checkedQueries.indexOf(value) !== -1) {
        return;
      }
      checkedQueries.push(value);
    }
    const queriesCount = data.length;
    const checkedQueriesCount = checkedQueries.length;
    const queriesAreAllChecked = (queriesCount === checkedQueriesCount);
    this.setState({
      checkedQueries,
      queriesAreAllChecked,
      queriesChecksAreIndeterminate: (!queriesAreAllChecked && checkedQueriesCount > 0),
    });
  }

  handleCombine({ key }) {
    const { data } = this.props;

    const { checkedQueries, display } = this.state;
    const defaultDisplay = cloneDeep(this.props.display);
    display.push(defaultDisplay);

    if (checkedQueries.length > 1) {
      const { onBatchEditCallback } = this.props;
      const sortedCheckedQueries = cloneDeep(checkedQueries);
      sortedCheckedQueries.sort((a, b) => this.findQueryIndexForKey(a) - this.findQueryIndexForKey(b));
      const instructions = sortedCheckedQueries.reduce((accumulator, query) => {
        const subquery = createSubqueryInstruction(query);
        const operator = createOperatorInstruction(key);
        return [...accumulator, subquery, operator];
      }, []);

      instructions.pop();
      const newSubquery = {
        key: uuidv1(),
        instructions,
      };
      const newDraft = [
        ...data,
        newSubquery,
      ];
      this.setState({
        checkedQueries: [],
        display,
        statementVisualClueText: this.props.intl.formatMessage({ id: 'screen.patientvariant.statementVisualClue.modification.text' }),
      }, () => {
        onBatchEditCallback(newDraft, newSubquery);
      });
    }
  }

  handleCheckAllQueries(e) {
    const { target } = e;
    const { checked } = target;
    if (!checked) {
      this.setState({
        checkedQueries: [],
        queriesChecksAreIndeterminate: false,
        queriesAreAllChecked: false,
      });
    } else {
      const { data } = this.props;
      const checkedQueries = data.reduce((accumulator, query) => [...accumulator, query.key], []);
      this.setState({
        checkedQueries,
        queriesChecksAreIndeterminate: false,
        queriesAreAllChecked: true,
      });
    }
  }

  getSubqueryKeys(keysToSearchFor) {
    const { data } = this.props;
    const subqueryKeys = data.filter(({ instructions }) => Boolean(instructions.find(i => i.type === INSTRUCTION_TYPE_SUBQUERY && keysToSearchFor.indexOf(i.data.query) !== -1))).map(({ key }) => key);
    return subqueryKeys;
  }

  handleRemoveChecked() {
    if (this.isRemovable()) {
      const { checkedQueries } = this.state;
      const subqueryKeys = this.getSubqueryKeys(checkedQueries);
      if (!isEmpty(subqueryKeys)) {
        this.showDeleteConfirm(checkedQueries);
      } else {
        this.confirmRemoveChecked();
      }
    }
  }

  showDeleteConfirm(keys) {
    const { confirm } = Modal;
    const { intl } = this.props;
    const modalTitle = intl.formatMessage({ id: 'screen.patientvariant.statement.modal.title' });
    const modalContent = intl.formatMessage({ id: 'screen.patientvariant.statement.modal.content' });
    const modalOk = intl.formatMessage({ id: 'screen.patientvariant.statement.modal.ok' });
    const modalCancel = intl.formatMessage({ id: 'screen.patientvariant.statement.modal.cancel' });
    confirm({
      title: modalTitle,
      content: modalContent,
      okText: modalOk,
      okType: 'danger',
      cancelText: modalCancel,
      onOk: () => {
        this.confirmRemove(keys);
      },
    });
  }


  handleCancelModal() {
    this.setState({
      saveTitleModalVisible: false,
      // saveTitleModalConfirmLoading: false,
    });
  }

  confirmRemoveChecked() {
    const { checkedQueries } = this.state;
    const { onRemoveCallback } = this.props;
    const keysToRemove = checkedQueries.reduce((accumulator, key) => [...accumulator, key], []);
    this.setState({
      checkedQueries: [],
      queriesChecksAreIndeterminate: false,
      queriesAreAllChecked: false,
      statementVisualClueText: this.props.intl.formatMessage({ id: 'screen.patientvariant.statementVisualClue.modification.text' }),
    }, () => {
      onRemoveCallback(keysToRemove);
    });
  }

  handleNewQuery(event, query = null) {
    const { onEditCallback } = this.props;
    const { display } = this.state;

    const newQuery = query || {
      key: uuidv1(),
      instructions: [],
    };
    const newDisplay = cloneDeep(this.props.display);
    display.push(newDisplay);
    this.setState({
      display,
      statementVisualClueText: this.props.intl.formatMessage({ id: 'screen.patientvariant.statementVisualClue.modification.text' }),
    }, () => {
      onEditCallback(newQuery);
    });
  }

  findQueryIndexForKey(key) {
    const { data } = this.props;
    return findIndex(data, { key });
  }

  findQueryTitle(key) {
    const { data } = this.props;
    const query = find(data, { key })
    return (query ? query.title : '')
  }

  onPositionChange(expandIconPosition) {
    this.setState({ expandIconPosition });
  }

  onStatementTitleChange(e) {
    const { value } = e.target;
    const width = this.getTitleWidth(value);

    e.target.style.width = `calc(13px + ${width}ch)`;

    this.setState({
      statementTitle: value,
      statementVisualClueText: this.props.intl.formatMessage({ id: 'screen.patientvariant.statementVisualClue.modification.text' }),
    });
  }

  onStatementTitleChangeEnter(e){
    e.target.blur()

    this.onStatementTitleChange(e)
  }

  onModalSaveTitleInputChange(e) {
    const { value } = e.target;
    this.setState({ saveTitleModalInputValue: value });
  }

  getTitleWidth(value) {
    const x0 = ['i', 'l', 'j', ';', ',', '|', ' ' ];
    const x1 = ['t', 'I', ':', '.','[',']' , '-', '/','!' , '"' ];
    const x2 = ['r', 'f','(', ')',  '{', '}' ]
    const x3 = ['v' , 'x' , 'y' ,'z' ,'_' ,'*','»', '«']
    const x4 = ['c', 'k' , 's' ]
    const x5 = ['g', 'p', 'q', 'b', 'd', 'h' , 'n', 'u','û', 'ù' ,'ü', 'o', 'ô', 'ö', 'E','Ê', 'É', 'È', 'Ë' ,'J','+','=', '$','1','2','3', '4', '5', '6', '7' , '8', '9', '0']
    const x6 = ['T', 'S' , 'Y','Z']
    const x7 = ['K',  'X', 'B', 'R', 'P' , '&', '#'];
    const x8 = ['U','Ù', 'Ü','Û', 'V','C' ,'D'];
    const x9 = ['A'];
    const x10 = ['G','O', 'Q' ];
    const x11 = ['H', 'N' ];
    const x12 = [ 'w','%'];
    const x13 = [ 'm', 'M'];
    const x14 = ['W'];

    let numberOf_X0_Letter =0
    let numberOf_X1_Letter =0
    let numberOf_X2_Letter =0
    let numberOf_X3_Letter =0
    let numberOf_X4_Letter = 0;
    let numberOf_X_Letter = 0;
    let numberOf_X5_Letter =0;
    let numberOf_X6_Letter = 0;
    let numberOf_X7_Letter = 0;
    let numberOf_X8_Letter = 0;
    let numberOf_X9_Letter = 0;
    let numberOf_X10_Letter = 0;
    let numberOf_X11_Letter = 0;
    let numberOf_X12_Letter = 0;
    let numberOf_X13_Letter = 0;
    let numberOf_X14_Letter = 0;

    const map = Array.prototype.map;
    map.call(value, (eachLetter) => {
      if (x0.includes(eachLetter)) {
        numberOf_X0_Letter += 1;
      } else if (x1.includes(eachLetter)) {
        numberOf_X1_Letter += 1;
      } else if(x2.includes(eachLetter) ){
        numberOf_X2_Letter +=1;
      }else if(x3.includes(eachLetter) ){
        numberOf_X3_Letter +=1;
      }else if(x4.includes(eachLetter)){
        numberOf_X4_Letter += 1 ;
      } else if(x5.includes(eachLetter)){
        numberOf_X5_Letter += 1;
      } else if (x6.includes(eachLetter)) {
        numberOf_X6_Letter += 1;
      } else if (x7.includes(eachLetter)) {
        numberOf_X7_Letter += 1;
      }else if (x8.includes(eachLetter)) {
        numberOf_X8_Letter += 1;
      }else if (x9.includes(eachLetter)) {
        numberOf_X9_Letter += 1;
      }else if (x10.includes(eachLetter)) {
        numberOf_X10_Letter += 1;
      }else if (x11.includes(eachLetter)) {
        numberOf_X11_Letter += 1;
      }else if (x12.includes(eachLetter)) {
        numberOf_X12_Letter += 1;
      }else if (x13.includes(eachLetter)) {
        numberOf_X13_Letter += 1;
      } else if (x14.includes(eachLetter)) {
        numberOf_X14_Letter += 1;
      } else {
        numberOf_X_Letter += 1;
      }
    });
    const width =   (numberOf_X0_Letter *0.47) + (numberOf_X1_Letter *0.6) + (numberOf_X2_Letter * 0.64) + (numberOf_X3_Letter * 0.90) + (numberOf_X4_Letter * 0.94) +
                    (numberOf_X_Letter * 0.98) + (numberOf_X5_Letter * 1.02) + (numberOf_X6_Letter * 1.1) + (numberOf_X7_Letter * 1.14) + (numberOf_X8_Letter * 1.17)+ (numberOf_X9_Letter * 1.20) +
                    (numberOf_X10_Letter * 1.24) + (numberOf_X11_Letter * 1.29) + (numberOf_X12_Letter * 1.33) + (numberOf_X13_Letter * 1.56) + (numberOf_X14_Letter * 1.58);
    return width;
  }

  handleFocus() {
    const input = document.querySelector('#statementTitle');
    input.focus();
  }

  onFocusTitle(e) {
    const { onFocus } = this.state;
    e.target.select();
    this.setState({ onFocus: true });
  }

  onBlurTitle(e) {
    this.setState({ onFocus: false });
  }

  onBlurDropdown(e){
    this.setState({dropDownIsOpen:false})
  }

  handleFocusDropdown(e){
    const{dropDownIsOpen} = this.state
    console.log("coucou1")
    this.setState({dropDownIsOpen:!dropDownIsOpen})
  }

  deleteDropDown(e){
    console.log("coucou2")
  this.setState({popConfirmDropDownIsOpen:true})
  }

  onCancel(e){
  this.setState({popConfirmDropDownIsOpen:false})
  }
  test(){
    console.log("Patate")
  }

  render() {
    const { data, activeStatementId, statements } = this.props;
    const activeStatement = statements[activeStatementId];
    if (!data || !activeStatement) return null;

    const { dropDownIsOpen, popConfirmDropDownIsOpen } = this.state;
    if (!data) return null;
    const {
      activeQuery, externalData, options, intl, facets, categories, searchData, target, activeStatementTotals,
    } = this.props;
    const {
      display, original, checkedQueries, saveTitleModalVisible, onFocus,
    } = this.state;
    const {
      reorderable
    } = options;

    const inactiveStatementKeys = Object.keys(statements).filter(key => (key !== 'draft' && key !== activeStatementId));
    const statementTitle = this.state.statementTitle !== null ? this.state.statementTitle : activeStatement.title;
    const checkedQueriesCount = checkedQueries.length;
    const newText = intl.formatMessage({ id: 'screen.patientvariant.statement.new' });
    const saveText = intl.formatMessage({ id: 'screen.patientvariant.statement.save' });
    const deleteText = intl.formatMessage({ id: 'screen.patientvariant.statement.delete' });
    const newQueryText = intl.formatMessage({ id: 'screen.patientvariant.statement.newQuery' });
    const myFilterText = intl.formatMessage({ id: 'screen.patientvariant.statement.myFilter' });
    const duplicateText = intl.formatMessage({ id: 'screen.patientvariant.query.menu.duplicate' });
    const editTitleText = intl.formatMessage({ id: 'screen.patientvariant.query.menu.editTitle' });
    const defaultFilterText = intl.formatMessage({ id: 'screen.patientvariant.statement.tooltip.defaultFilter' });

    const modalTitleSaveTitle = intl.formatMessage({ id: 'screen.patientvariant.statementTitleSave.modal.title' });
    const modalTitleSaveContent = intl.formatMessage({ id: 'screen.patientvariant.statementTitleSave.modal.content' });
    const modalTitleSaveInputLabel = intl.formatMessage({ id: 'screen.patientvariant.statementTitleSave.modal.inputLabel' });
    const modalTitleSaveInputDefault = intl.formatMessage({ id: 'screen.patientvariant.statementTitleSave.modal.inputDefault' });
    const modalTitleSaveOk = intl.formatMessage({ id: 'screen.patientvariant.statementTitleSave.modal.ok' });
    const modalTitleSaveCancel = intl.formatMessage({ id: 'screen.patientvariant.statementTitleSave.modal.cancel' });
    const width = this.getTitleWidth(statementTitle);

    let containsEmptyQueries = false;

    const queries = data.reduce((accumulator, query, index) => {
      const isChecked = checkedQueries.indexOf(query.key) !== -1;
      const isActive = activeQuery === query.key;
      const initial = find(original, { key: query.key }) || null;
      const classNames = [styleStatement.queryContainer];
      const isDirty = !isEqual(initial, query);
      if (!containsEmptyQueries) {
        containsEmptyQueries = query.instructions.length < 1;
      }

      if (isDirty) { classNames.push(styleStatement.dirtyContainer); }
      if (isActive) { classNames.push(styleStatement.activeContainer); } else { classNames.push(styleStatement.inactiveContainer); }
      if (!query.title) {
        query.title = `Requête ${(index + 1)}`;
      }

      return [...accumulator, (
        <div className={classNames.join(' ')} key={query.key}>
          <Checkbox
            className={isChecked ? `${styleStatement.check} ${styleStatement.querySelector} ${!isActive ? styleStatement.unActiveCheck : null}` : `${styleStatement.querySelector} ${!isActive ? styleStatement.unActiveCheck : null}`}
            key={`selector-${query.key}`}
            value={query.key}
            checked={isChecked}
            onChange={this.handleCheckQuery}
          />
          <Query
            key={query.key}
            original={initial}
            draft={query}
            display={display[index]}
            options={options}
            index={index}
            active={isActive}
            results={(activeStatementTotals[query.key] ? activeStatementTotals[query.key] : null)}
            intl={intl}
            facets={(facets[query.key] ? facets[query.key] : {})}
            target={target}
            categories={categories}
            onCopyCallback={this.handleCopy}
            onEditCallback={this.handleEdit}
            onDisplayCallback={this.handleDisplay}
            onDuplicateCallback={this.handleDuplicate}
            onRemoveCallback={this.handleRemove}
            onSelectCallback={this.handleSelect}
            onUndoCallback={this.handleUndo}
            onClickCallback={this.handleClick}
            findQueryIndexForKey={this.findQueryIndexForKey}
            findQueryTitle={this.findQueryTitle}
            searchData={searchData}
            externalData={externalData}
          />
        </div>
      )];
    }, []);

    // antd Modal have a strange binding with their button
    // need to declare them here
    const handleSaveTitleModalCancel = () => {
      this.setState({
        saveTitleModalVisible: false,
      });
    };

    const handleSaveTitleModalOk = () => {
      const newStatement = {
        description: this.state.saveTitleModalInputValue,
        title: this.state.saveTitleModalInputValue,
        queries: [{
          key: uuidv1(),
          instructions: [],
        }],
      };
      this.setState({
        saveTitleModalVisible: false,
      }, this.props.onCreateDraftStatementCallback(newStatement));
    };

    const contextSelectStatement = ({ key }) => {
      console.log("key", key)
      this.selectStatement(key);
    };

    return (
      <div className={styleStatement.statement}>
        <Modal
          title={modalTitleSaveTitle}
          okText={modalTitleSaveOk}
          cancelText={modalTitleSaveCancel}
          visible={saveTitleModalVisible}
          onCancel={handleSaveTitleModalCancel}
          onOk={handleSaveTitleModalOk}
          zIndex={99999}

        >
          <h2>{modalTitleSaveContent}</h2>
          {modalTitleSaveInputLabel}
          <br />
          <Input
            onChange={this.onModalSaveTitleInputChange}
            defaultValue={modalTitleSaveInputDefault}
            value={this.state.saveTitleModalInputValue}
          />

        </Modal>
        <div className={styleStatement.header}>
          {this.isDirty() && (
            <Row type="flex" className={styleStatement.toolbar}>
              <div>
                { this.props.intl.formatMessage({ id: 'screen.patientvariant.statementVisualClue.modification.text' })}
              </div>
            </Row>
          )}
          <Row type="flex" className={styleStatement.toolbar}>
            <div className={styleStatement.navigation}>
              <div>
                <div  className={styleStatement.title}>
                      <Tooltip overlayClassName={styleStatement.tooltip} title={editTitleText}>
                          <div>

                                <Input
                                    id="statementTitle"
                                    onChange={this.onStatementTitleChange}
                                    onFocus={this.onFocusTitle}
                                    onBlur={this.onBlurTitle}
                                    onPressEnter={this.onStatementTitleChangeEnter}
                                    autocomplete="off"
                                    value={statementTitle}
                                    disabled={activeStatementId == null}
                                    style={{width:`calc(13px + ${width}ch)`}}
                                />


                                <IconKit
                                    icon={ic_edit}
                                    size={18}
                                    onClick={this.handleFocus}
                                    className={`${styleStatement.iconTitle} ${styleStatement.icon} ${onFocus ? `${styleStatement.focusIcon}` : null}`}

                                />


                          </div>
                      </Tooltip>
                      {activeStatementId !== 'draft' && (
                      <Tooltip overlayClassName={styleStatement.tooltip} title={defaultFilterText}>
                      <Button
                          type="default"
                          className={styleStatement.button}
                          onClick={this.setStatementAsDefault}
                          disabled={activeStatementId == null}
                        >

                        <Icon
                            className={activeStatement.isDefault ? `${styleStatement.starFilled} ${styleStatement.star}` : `${styleStatement.starOutlined} ${styleStatement.star}`}
                            type="star"
                            theme={activeStatement.isDefault ? 'filled' : 'outlined'}
                        />

                      </Button>
                      </Tooltip>)}
                </div>
                <div>
                  <Button
                    type="default"
                    onClick={this.createDraftStatement}
                    disabled={this.actionIsDisabled('new')}
                    className={styleStatement.button}
                  >
                    <IconKit size={20} icon={ic_note_add} />
                    {newText}
                  </Button>
                  <Button
                    type="default"
                    disabled={this.actionIsDisabled('save')}
                    onClick={this.updateStatement}
                    className={styleStatement.button}
                  >
                    <IconKit size={20} icon={ic_save} />
                    {saveText}
                  </Button>
                  <Button
                      type="default"
                      className={styleStatement.button}
                      disabled={this.actionIsDisabled('duplicate')}
                      onClick={this.duplicateStatement}
                  >
                    <IconKit size={20} icon={ic_content_copy} />
                    {duplicateText}
                  </Button>
                      <Button
                          type="default"
                          disabled={this.actionIsDisabled('delete')}
                          className={styleStatement.button}
                      >
                          <Popconfirm
                            title="Vous perdrez toutes les modifications non enregistrées."
                            okText={deleteText}
                            cancelText="Annuler"
                            onConfirm={this.deleteStatement}
                            icon={null}
                            overlayClassName={styleStatement.popconfirm}
                          >
                              <a>
                                <IconKit size={20} icon={ic_delete} />
                                {deleteText}
                              </a>
                          </Popconfirm>
                      </Button>


                  <Divider type="vertical" className={styleStatement.divider} />
                  <Button
                    type="disabled"
                    className={styleStatement.button}
                    disabled={this.actionIsDisabled('share')}
                  >
                    <IconKit size={20} icon={ic_share} />
                  </Button>
                  <Divider type="vertical" className={styleStatement.divider} />
                      <Dropdown
                        trigger={['click']}
                        className={`${styleStatement.button} ${dropDownIsOpen ? `${styleStatement.buttonActive}` : null}`}
                        disabled={(inactiveStatementKeys.length == 0)}
                        onBlur= {this.onBlurDropdown}
                        onClick={this.handleFocusDropdown}
                        visible={true}
                        overlayClassName={styleStatement.dropdown}
                        overlay={(inactiveStatementKeys.length > 0 ? (

                                                              <Menu >
                                                                {
                                                                  inactiveStatementKeys.map(key => (

                                                                          <Menu.Item key={statements[key].uid}>
                                                                              {this.state.statementVisualClueText || !isEqual(this.props.data, this.props.original) ?
                                                                                <Popconfirm
                                                                                  title="Vous perdrez toutes les modifications non enregistrées."
                                                                                  okText="Nouveau"
                                                                                  cancelText="Annuler"
                                                                                  onConfirm={this.selectStatement}
                                                                                  onCancel={this.onCancel}
                                                                                  icon={null}
                                                                                  overlayClassName={styleStatement.popconfirm}
                                                                                  dataid={statements[key].uid}
                                                                                >
                                                                                  <div className={styleStatement.dropdownTitle} >
                                                                                  {statements[key].title}
                                                                                  </div>
                                                                                  </Popconfirm>
                                                                                  :null
                                                                              }

                                                                                <div className={styleStatement.dropdownNavigation}>
                                                                                    <IconKit
                                                                                      size={20}
                                                                                      icon={ic_content_copy}
                                                                                      dataid={statements[key].uid}
                                                                                      className={styleStatement.displayOnHover}
                                                                                      onClick={this.duplicateStatement}
                                                                                    />
                                                                                    <Popconfirm
                                                                                      title="Vous perdrez toutes les modifications non enregistrées."
                                                                                      placement="topRight"
                                                                                      okText={deleteText}
                                                                                      cancelText="Annuler"
                                                                                      onConfirm={this.deleteStatement}
                                                                                      onCancel={this.onCancel}
                                                                                      icon={null}
                                                                                      overlayClassName={styleStatement.popconfirm}
                                                                                    >
                                                                                        <IconKit
                                                                                          size={20}
                                                                                          icon={ic_delete}
                                                                                          dataid={statements[key].uid}
                                                                                          className={styleStatement.displayOnHover}
                                                                                          onClick={this.deleteDropDown}
                                                                                        />
                                                                                    </Popconfirm>
                                                                                    { (<Icon
                                                                                      type="star"
                                                                                      size={20}
                                                                                      className={statements[key].isDefault ? `${styleStatement.starFilled} ${styleStatement.star}` : `${styleStatement.starOutlined} ${styleStatement.displayOnHover} ${styleStatement.star}`}
                                                                                      theme={statements[key].isDefault ? 'filled' : 'outlined'}
                                                                                      dataid={statements[key].uid}
                                                                                      onClick={this.setStatementAsDefault}
                                                                                    />)}
                                                                                </div>

                                                                          </Menu.Item>

                                                                    ))
                                                                  }
                                                              </Menu>
                                                            ) : (<></>))
                                                          }>
                        <Button>
                            <IconKit
                              size={20}
                              icon={ic_folder}
                              onClick={this.duplicateStatement}

                            />
                          {myFilterText}
                        </Button>
                      </Dropdown>

                </div>
              </div>

            </div>
            <Divider className={styleStatement.dividerHorizontal} />
          </Row>
          <Row type="flex" className={styleStatement.toolbar}>
            <Menu onClick={this.handleCombine} mode="horizontal" className={styleStatement.menuCombine}>
              <Menu.Item key={OPERATOR_TYPE_AND} disabled={checkedQueriesCount < 2}>
                <Button
                  className={`${styleStatement.button} ${styleStatement.combineBtn}`}
                  disabled={checkedQueriesCount < 2}
                >
                  <svg>
                    { getSvgPathFromOperatorType(OPERATOR_TYPE_AND) }
                  </svg>
                          Intersection
                </Button>
              </Menu.Item>
              <Menu.Item key={OPERATOR_TYPE_OR} disabled={checkedQueriesCount < 2}>
                <Button
                  className={`${styleStatement.button} ${styleStatement.combineBtn}`}
                  disabled={checkedQueriesCount < 2}
                >
                  <svg>
                    { getSvgPathFromOperatorType(OPERATOR_TYPE_OR) }
                  </svg>
                          Union
                </Button>
              </Menu.Item>
              <Menu.Item key={OPERATOR_TYPE_AND_NOT} disabled={checkedQueriesCount < 2}>
                <Button
                  className={`${styleStatement.button} ${styleStatement.combineBtn}`}
                  disabled={checkedQueriesCount < 2}
                >
                  <svg>
                    { getSvgPathFromOperatorType(OPERATOR_TYPE_AND_NOT) }
                  </svg>
                          Exclusion
                </Button>
              </Menu.Item>
            </Menu>

          </Row>

        </div>
        <div className={styleStatement.body}>
          {reorderable
            ? (
              <DragSortableList
                key="sortable"
                type="vertical"
                items={queries.map((query, index) => ({ id: query.key, content: query, index }))}
                onSort={this.handleReorder}
                className={styleStatement.draggableContainer}
              />
            ) : queries
          }
        </div>
        <div className={styleStatement.footer}>
          <Button type="primary" disabled={containsEmptyQueries} onClick={this.handleNewQuery}>{newQueryText}</Button>
        </div>
      </div>
    );
  }
}

Statement.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  data: PropTypes.array.isRequired,
  activeStatementId: PropTypes.string,
  activeStatementTotals: PropTypes.shape({}),
  externalData: PropTypes.shape({}),
  display: PropTypes.shape({}),
  options: PropTypes.shape({}),
  target: PropTypes.shape({}),
  onSelectCallback: PropTypes.func,
  onEditCallback: PropTypes.func,
  onSortCallback: PropTypes.func,
  onRemoveCallback: PropTypes.func,
  onDuplicateCallback: PropTypes.func,
  onDraftHistoryUndoCallback: PropTypes.func,
  onGetStatementsCallback: PropTypes.func,
  onCreateDraftStatementCallback: PropTypes.func,
  onUpdateStatementCallback: PropTypes.func,
  onDeleteStatementCallback: PropTypes.func,
  onSelectStatementCallback: PropTypes.func,
  onDuplicateStatementCallback: PropTypes.func,
};

Statement.defaultProps = {
  display: {
    compoundOperators: true,
    viewableSqon: false,
  },
  options: {
    copyable: true,
    duplicatable: true,
    editable: true,
    removable: true,
    reorderable: true,
    selectable: true,
    undoable: true,
  },
  activeStatementId: '',
  activeStatementTotals: {},
  target: {},
  externalData: {},
  onSelectCallback: () => {},
  onEditCallback: () => {},
  onBatchEditCallback: () => {},
  onSortCallback: () => {},
  onRemoveCallback: () => {},
  onDuplicateCallback: () => {},
  onDraftHistoryUndoCallback: () => {},
  onGetStatementsCallback: () => {},
  onCreateDraftStatementCallback: () => {},
  onUpdateStatementCallback: () => {},
  onDeleteStatementCallback: () => {},
  onSelectStatementCallback: () => {},
  onDuplicateStatementCallback: () => {},
};

export default Statement;
