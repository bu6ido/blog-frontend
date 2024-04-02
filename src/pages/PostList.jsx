import { useState, useCallback, useEffect, useRef, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTableCommonSearch } from 'hooks/use-table-common-search';
import { useMounted } from 'hooks/use-mounted';
import { useSelection } from 'hooks/use-selection';
import { useDialog } from 'hooks/use-dialog';
import { postsApi } from 'api/posts';
import { getErrorMessage, getErrorsList, ErrorContext } from 'lib/common';
import Pagination from 'components/Pagination';
import Button from 'components/Button';

const initialPostsState = {
    viewName: 'posts',
    filters: {
      query: '',
    },
    page: 1,
    rowsPerPage: 5, //storageGet('posts.rowsPerPage', 5),
    sortBy: 'id', //storageGet('posts.sortBy', 'name'),
    sortDir: 'asc', //storageGet('posts.sortDir', 'asc'),
  };

const usePostsStore = (searchState) => {
  const isMounted = useMounted();
  const [state, setState] = useState({
    posts: [],
    postsCount: 0,
  });
  const errorContext = useContext(ErrorContext);
  
  const handlePostsGet = useCallback(async () => {
    try {
      const response = await postsApi.getPosts(searchState);
      
      if (isMounted()) {
        if (errorContext) {
          errorContext.setStatus(null);
          errorContext.setErrors([]);
        }
        
        setState({
          posts: response.data,
          postsCount: response.count,
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
      handlePostsGet();
  }, [searchState]);

  return {
    ...state,  
  };
};

const usePostsDelete = ({ onPageChange }) => {
  const isMounted = useMounted();
  const errorContext = useContext(ErrorContext);

  const deletePost = useCallback(async (event, postId) => {
    try {
      const result = await postsApi.deletePost(postId);
      if (errorContext) {
        errorContext.setStatus(null);
        errorContext.setErrors([]);
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
    deletePost, 
  }
};

const DlgDeletePost = (props) => {
  const { data, onClose, onConfirm, open } = props;
  const { post } = data || {};
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
      <label>Are you sure you want to delete post: {post?.title} ?</label>

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
  
const PostListTable = (props) => {
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

  const { deletePost } = usePostsDelete({ onPageChange });
  
  const dlgDeletePost = useDialog();
  
  const handleDeletePostConfirm = useCallback(async (event) => {
    const { post } = dlgDeletePost.data;
    if (post && post.id) {
      deletePost(event, post.id);
    }
    dlgDeletePost.handleClose();
  }, [dlgDeletePost]);
  
  return (
  <div>
    <div>
      <input type="text" value={filters.query} onChange={handleQueryChange} />
    </div>
    <table>
      <thead>
        <tr>
          <th><SortComp field="id" label="Id" /></th>
          <th><SortComp field="title" label="Title" /></th>
          <th><SortComp field="user_name" label="User" /></th>
          <th>Comments</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((post) => {
          const isSelected = selected.includes(post.id);
          
          return (
            <tr
              key={post.id}
              selected={isSelected}
            >
              <td>{post.id}</td>
              <td>{post.title}</td>
              <td>{post.user?.name}</td>
              <td className="text-right">{post.comments_count}</td>
              <td>
                <Link
                  to={`/posts/${post.id}`}
                >
                  <Button type="button">
                    Edit
                  </Button>
                </Link>          
                
                &nbsp;
                
                <Button 
                  type="button"
                  onClick={(e) => dlgDeletePost.handleOpen({ post })}
                >
                  Delete
                </Button>    
              </td>
            </tr>
          );          
        })}
      </tbody>
    </table>
    <Pagination 
      count={count} 
      page={page} 
      rowsPerPage={rowsPerPage} 
      rowsPerPageOptions={[5, 10, 20]}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
    />

    <Link
      to="/posts/create"
    >
      <Button type="button" className="mt-3">
        Create new Post
      </Button>
    </Link> 
    
    <DlgDeletePost
      data={dlgDeletePost.data}
      onClose={dlgDeletePost.handleClose}
      onConfirm={handleDeletePostConfirm}
      open={dlgDeletePost.open}
    />             
  </div>
  );
};

const PostList = (props) => {
  const postsSearch = useTableCommonSearch(initialPostsState);
  const postsStore = usePostsStore(postsSearch.state);
  
  return (
    <div>
      <PostListTable
        count={postsStore.postsCount}
        items={postsStore.posts}
        onFiltersChange={postsSearch.handleFiltersChange}
        //onDeselectAll={postsSelection.handleDeselectAll}
        //onDeselectOne={postsSelection.handleDeselectOne}
        onPageChange={postsSearch.handlePageChange}
        onRowsPerPageChange={postsSearch.handleRowsPerPageChange}
        onSortChange={postsSearch.handleSortChange}
        //onSelectAll={postsSelection.handleSelectAll}
        //onSelectOne={postsSelection.handleSelectOne}
        filters={postsSearch.state.filters}
        page={postsSearch.state.page}
        rowsPerPage={postsSearch.state.rowsPerPage}
        sortBy={postsSearch.state.sortBy}
        sortDir={postsSearch.state.sortDir}
        //selected={postsSelection.selected}      
      />
    </div>
  );
};

export default PostList;

