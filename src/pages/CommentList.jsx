import { useState, useCallback, useEffect, useRef, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTableCommonSearch } from 'hooks/use-table-common-search';
import { useMounted } from 'hooks/use-mounted';
import { useSelection } from 'hooks/use-selection';
import { useDialog } from 'hooks/use-dialog';
import { commentsApi } from 'api/comments';
import { getErrorMessage, getErrorsList, ErrorContext } from 'lib/common';
import Pagination from 'components/Pagination';
import Button from 'components/Button';

const initialCommentsState = {
    viewName: 'comments',
    filters: {
      query: '',
    },
    page: 1,
    rowsPerPage: 5, //storageGet('comments.rowsPerPage', 5),
    sortBy: 'id', //storageGet('comments.sortBy', 'name'),
    sortDir: 'desc', //storageGet('comments.sortDir', 'asc'),
  };

const useCommentsStore = (searchState) => {
  const isMounted = useMounted();
  const [state, setState] = useState({
    comments: [],
    commentsCount: 0,
  });
  const errorContext = useContext(ErrorContext);

  const handleCommentsGet = useCallback(async () => {
    try {
      const response = await commentsApi.getComments(searchState);
      
      if (isMounted()) {
        if (errorContext) {
          errorContext.setStatus(null);
          errorContext.setErrors([]);
        }
              
        setState({
          comments: response.data,
          commentsCount: response.count,
        });

      }
    } catch (err) {
      let msg = getErrorMessage(err);
      console.error(msg);
      if (isMounted()) {
//        toast.error(msg);
        if (errorContext) {
          errorContext.setStatus(err.response?.status);
          errorContext.setErrors(getErrorsList(err));
        }  
      }      
    }
  }, [searchState, isMounted, errorContext]);

  useEffect(() => {
      handleCommentsGet();
  }, [searchState]);

  return {
    ...state,  
  };
};

const useCommentsDelete = ({ onPageChange }) => {
  const isMounted = useMounted();
  const errorContext = useContext(ErrorContext);
  
  const deleteComment = useCallback(async (event, commentId) => {
    try {
      const result = await commentsApi.deleteComment(commentId);
      if (isMounted()) {
        if (errorContext) {
          errorContext.setStatus(null);
          errorContext.setErrors([]);
        }
      }
      
      // trigger table refresh
      if (onPageChange) {
        onPageChange(event, 1);
      }
    } catch (err) {
      let msg = getErrorMessage(err);
      console.error(msg);
      /*toast.error(msg);*/
      if (isMounted()) {
        if (errorContext) {
          errorContext.setStatus(err.response?.status);
          errorContext.setErrors(getErrorsList(err)); 
        }       
      }      
    }
  }, [onPageChange, isMounted, errorContext]);

  return {
    deleteComment, 
  }
};

const DlgDeleteComment = (props) => {
  const { data, onClose, onConfirm, open } = props;
  const { comment } = data || {};
  const ref = useRef();

  useEffect(() => {
    if (open) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [open, ref]);
    
  return (
  <dialog 
    ref={ref}
    onCancel={onClose}
  >
    <form>
      <label>Are you sure you want to delete comment: {comment?.id} ?</label>

      <Button
        type="button"
        onClick={onConfirm}
      >
        Yes
      </Button>
      &nbsp;
      <Button
        type="button"
        onClick={onClose}
      >
        No
      </Button>
    </form>
  </dialog>
  );
};

  
const CommentListTable = (props) => {
  const {
    count = 0,
    items = [],
    onFiltersChange, 
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    onSortChange, 
    onSelectAll,
    onSelectOne,
    filters, 
    page = 0,
    rowsPerPage = 0,
    sortBy,
    sortDir = 'asc',
    selected = [],
  } = props;

  const handleQueryChange = useCallback((event) => {
    event.preventDefault();
    onFiltersChange({
      ...filters,
      query: event.target?.value,
    });      
  }, [onFiltersChange]);
    
  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;
  const enableBulkActions = selected.length > 0;

  const handleSorting = useCallback((field) => {
    if (!field) {
      return;  
    }
    if (field === sortBy) {
      let newSortDir = (sortDir === 'asc')? 'desc' : 'asc';
      onSortChange({ sortBy: field, sortDir: newSortDir });
    } else {
      onSortChange({ sortBy: field, sortDir: 'asc' });
    }
  }, [onSortChange, sortBy, sortDir]);
  
  const SortComp = ({field, label, ...rest}) => (
    <a onClick={() => handleSorting(field)}>
      {label} {(field === sortBy) && ((sortDir === 'asc')? <>&uarr;</> : <>&darr;</>)}
    </a>
  );

  const { deleteComment } = useCommentsDelete({ onPageChange });
    
  const dlgDeleteComment = useDialog();
  
  const handleDeleteCommentConfirm = useCallback(async (event) => {
    const { comment } = dlgDeleteComment.data;
    if (comment && comment.id) {
      deleteComment(event, comment.id);
    }
    dlgDeleteComment.handleClose();
  }, [dlgDeleteComment]);
  
  return (
  <div className="flex flex-col justify-start items-center gap-2 p-2">
    <div>
      <input type="text" value={filters.query} onChange={handleQueryChange} />
    </div>
    <div className="self-stretch overflow-x-auto">    
    <table className="w-max">
      <thead>
        <tr>
          <th><SortComp field="id" label="Id" /></th>
          <th><SortComp field="content" label="Content" /></th>
          <th><SortComp field="post_title" label="Post" /></th>
          <th><SortComp field="user_name" label="User" /></th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((comment) => {
          const isSelected = selected.includes(comment.id);
          
          return (
            <tr
              key={comment.id}
              selected={isSelected}
            >
              <td>{comment.id}</td>
              <td>{comment.content}</td>
              <td>{comment.post?.title}</td>
              <td>{comment.user?.name}</td>
              <td>
                <Link
                  to={`/comments/${comment.id}`}
                >
                  <Button type="button">
                    Edit
                  </Button>
                </Link>          
                
                &nbsp;
                
                <Button 
                  type="button"
                  onClick={(e) => dlgDeleteComment.handleOpen({ comment })}
                >
                  Delete
                </Button>    
              </td>
            </tr>
          );          
        })}
      </tbody>
    </table>
    </div>
    <Pagination 
      count={count} 
      page={page} 
      rowsPerPage={rowsPerPage} 
      rowsPerPageOptions={[5, 10, 20]}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
    />

    <Link
      to={`/comments/create/${filters.postId}`}
    >
      <Button type="button" className="mt-3">
        Create new Comment
      </Button>
    </Link> 
    
    <DlgDeleteComment
      data={dlgDeleteComment.data}
      onClose={dlgDeleteComment.handleClose}
      onConfirm={handleDeleteCommentConfirm}
      open={dlgDeleteComment.open}
    />             
  </div>
  );
};

const CommentList = (props) => {
  const { postId } = props;
  const mixedState = {...initialCommentsState, filters: {...initialCommentsState.filters, postId } };
  const commentsSearch = useTableCommonSearch(mixedState);
  const commentsStore = useCommentsStore(commentsSearch.state);
  
  return (
    <div>
      <CommentListTable
        count={commentsStore.commentsCount}
        items={commentsStore.comments}
        onFiltersChange={commentsSearch.handleFiltersChange}
        //onDeselectAll={commentsSelection.handleDeselectAll}
        //onDeselectOne={commentsSelection.handleDeselectOne}
        onPageChange={commentsSearch.handlePageChange}
        onRowsPerPageChange={commentsSearch.handleRowsPerPageChange}
        onSortChange={commentsSearch.handleSortChange}
        //onSelectAll={commentsSelection.handleSelectAll}
        //onSelectOne={commentsSelection.handleSelectOne}
        filters={commentsSearch.state.filters}
        page={commentsSearch.state.page}
        rowsPerPage={commentsSearch.state.rowsPerPage}
        sortBy={commentsSearch.state.sortBy}
        sortDir={commentsSearch.state.sortDir}
        //selected={commentsSelection.selected}      
      />
    </div>
  );
};

export default CommentList;

