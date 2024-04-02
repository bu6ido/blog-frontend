import { useState, useCallback, useEffect, useMemo, useContext } from 'react';
import { Link, useParams, useNavigate} from 'react-router-dom';
import { useMounted } from 'hooks/use-mounted';
import { postsApi } from 'api/posts';
import { getErrorMessage, getErrorsList, ErrorContext } from 'lib/common';
import { useAuth } from 'hooks/auth'
import AppLayout from 'components/Layouts/AppLayout';
import NotFoundPage from 'pages/404';
import CommentList from 'pages/CommentList';

const usePostGetSingle = (id) => {
  const isMounted = useMounted();
  const [post, setPost] = useState(null);
  const errorContext = useContext(ErrorContext);
  
  const handlePostsGet = useCallback(async () => {
    try {
      const response = await postsApi.getPost(id);
      
      if (isMounted()) {
        if (errorContext) {
          errorContext.setStatus(null);
          errorContext.setErrors([]);
        }
              
        setPost(response);
      }
    } catch (err) {
      let msg = getErrorMessage(err);
      console.error(msg);
      if (isMounted()) {
//        toast.error(msg);
        setPost(null);
        
        if (errorContext) {
          errorContext.setStatus(err.response?.status);
          errorContext.setErrors(getErrorsList(err)); 
        } 
      }      
    }
  }, [id, isMounted, errorContext]);

  useEffect(() => {
      handlePostsGet();
  }, [id]);

  return {
    post, 
  };
};

const usePostForm = (initialPost = null) => {
  const navigate = useNavigate();
  const isMounted = useMounted();
  const [post, setPost] = useState(initialPost);
  const errorContext = useContext(ErrorContext);
  const { user } = useAuth({ middleware: 'auth' });

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);
  
  const handleTitleChange = useCallback((e) => {
    setPost((prevState) => ({...prevState, title: e.target?.value }));
  }, [setPost]);

  const handleContentChange = useCallback((e) => {
    setPost((prevState) => ({...prevState, content: e.target?.value }));
  }, [setPost]);

  const validObj = useMemo(() => {
    let result = {};
    if (!post) {
      return result;
    }
    if (!(post.title && !!post.title.length)) {
      result.title = 'Title field is required!';
    }
    // else if (next validation) ...
    
    if (!(post.content && !!post.content.length)) {
      result.content = 'Content field is required!';
    }
    // else if (next validation) ...
    
    return result;
  }, [post]);
  
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!post) {
      return;
    }
    const errorsCount = Object.values(validObj).filter(x => x).length;
    if (errorsCount > 0) {
      return;
    }
    
    const modifPost = {...post, user_id: user?.id};

    try {
      const response = (modifPost?.id)? 
        await postsApi.updatePost(modifPost?.id, modifPost) : 
        await postsApi.createPost(modifPost);
      
      if (isMounted()) {
        if (errorContext) {
          errorContext.setStatus(null);
          errorContext.setErrors([]);
        }
//        setPost(response);
        navigate('/dashboard');
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
  }, [post, user, validObj, isMounted, errorContext]);

  return {
    post, validObj, handleTitleChange, handleContentChange, handleSubmit, 
  }
};

const PostForm = (props) => {
  const { post, validObj, onSubmit, onTitleChange, onContentChange } = props;
//  const { user } = useAuth({ middleware: 'auth' });
  return (
    <>
    <form onSubmit={onSubmit}>
      { post.id && <input type="hidden" name="id" defaultValue={post.id} /> }
      <input type="text" name="title" value={post.title} onChange={onTitleChange} />
      { validObj && validObj.title && <span>{validObj.title}</span> }
      <textarea name="content" rows={10} onChange={onContentChange} value={post.content} />
      { validObj && validObj.content && <span>{validObj.content}</span> }
      <input type="hidden" name="user_id" defaultValue={post.user_id} />
      <input type="submit" name="save_post" value="Save Post" />
    </form>
    
    { post.id && <CommentList postId={post.id} /> }
    </>
  );
};

export const PostCreate = (props) => {
  const newPost = useMemo(() => ({ id: null, title: '', content: '', user_id: null }), []);
  const postForm = usePostForm(newPost);
  
  return (
  <AppLayout
    header={
      <h2 className="font-semibold text-xl text-gray-800 leading-tight">
        Create Post
      </h2>
    }>
    <div className="py-12">
      <PostForm
        post={postForm.post}
        validObj={postForm.validObj}
        onSubmit={postForm.handleSubmit}
        onTitleChange={postForm.handleTitleChange}
        onContentChange={postForm.handleContentChange}
      />
    </div>    
  </AppLayout>
  );  
};

const PostEdit = (props) => {
  const isMounted = useMounted();
  const params = useParams();
  const postGetSingle = usePostGetSingle(parseInt(params.id, 10));
  const postForm = usePostForm(postGetSingle.post);
   
  if (postForm.post) {  
  return (
  <AppLayout
    header={
      <h2 className="font-semibold text-xl text-gray-800 leading-tight">
        Edit Post
      </h2>
    }>
    <div className="py-12">
      <PostForm
        post={postForm.post}
        validObj={postForm.validObj}
        onSubmit={postForm.handleSubmit}
        onTitleChange={postForm.handleTitleChange}
        onContentChange={postForm.handleContentChange}
      />
    </div>    
  </AppLayout>
  );
  } else return (
    <NotFoundPage />
  ); 
};

export default PostEdit;

