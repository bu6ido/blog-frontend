import { useState, useCallback, useEffect, useMemo, useContext } from 'react';
import { Link, useParams, useNavigate} from 'react-router-dom';
import { useMounted } from 'hooks/use-mounted';
import { commentsApi } from 'api/comments';
import { getErrorMessage, getErrorsList, ErrorContext } from 'lib/common';
import { useAuth } from 'hooks/auth'
import AppLayout from 'components/Layouts/AppLayout';
import Button from 'components/Button';
import NotFoundPage from 'pages/404';

const useCommentGetSingle = (id) => {
  const isMounted = useMounted();
  const [comment, setComment] = useState(null);
  const errorContext = useContext(ErrorContext);

  const handleCommentsGet = useCallback(async () => {
    try {
      const response = await commentsApi.getComment(id);
      
      if (isMounted()) {
        setComment(response);

        if (errorContext) {
          errorContext.setStatus(null);
          errorContext.setErrors([]);
        }        
      }
    } catch (err) {
      let msg = getErrorMessage(err);
      console.error(msg);
      if (isMounted()) {
//        toast.error(msg);
        setComment(null);
        
        if (errorContext) {
          errorContext.setStatus(err.response?.status);
          errorContext.setErrors(getErrorsList(err)); 
        }         
      }      
    }
  }, [id, isMounted, errorContext]);

  useEffect(() => {
      handleCommentsGet();
  }, [id]);

  return {
    comment, 
  };
};

const useCommentForm = (initialComment = null) => {
  const navigate = useNavigate();
  const isMounted = useMounted();
  const [comment, setComment] = useState(initialComment);
  const errorContext = useContext(ErrorContext);
  const { user } = useAuth({ middleware: 'auth' });

  useEffect(() => {
    setComment(initialComment);
  }, [initialComment]);
  
  const handleContentChange = useCallback((e) => {
    setComment((prevState) => ({...prevState, content: e.target?.value }));
  }, [setComment]);

  const validObj = useMemo(() => {
    let result = {};
    if (!comment) {
      return result;
    }
    if (!(comment.content && !!comment.content.length)) {
      result.content = 'Content field is required!';
    }
    // else if (next validation) ...
    
    return result;
  }, [comment]);
  
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!comment) {
      return;
    }
    const errorsCount = Object.values(validObj).filter(x => x).length;
    if (errorsCount > 0) {
      return;
    }
    
    const modifComment = {...comment, user_id: user?.id};

    try {
      const response = (modifComment?.id)? 
        await commentsApi.updateComment(modifComment?.id, modifComment) : 
        await commentsApi.createComment(modifComment);
      
      if (isMounted()) {
        if (errorContext) {
          errorContext.setStatus(null);
          errorContext.setErrors([]);
        }
//        setComent(response);
        navigate(`/posts/${modifComment.post_id}`);
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
  }, [comment, user, validObj, isMounted, errorContext]);

  return {
    comment, validObj, handleContentChange, handleSubmit, 
  }
};

const CommentForm = (props) => {
  const { comment, validObj, onSubmit, onContentChange } = props;
//  const { user } = useAuth({ middleware: 'auth' });
  return (
    <>
    <form onSubmit={onSubmit} className="flex flex-col justify-start items-stretch gap-2 p-2">
      { comment.id && <input type="hidden" name="id" defaultValue={comment.id} /> }
      { comment.user_id && comment.user && <label className="font-semibold">{comment.user.name}</label> }
      <textarea name="content" rows={10} onChange={onContentChange} value={comment.content} />
      { validObj && validObj.content && <span className="text-red-600">{validObj.content}</span> }
      <input type="hidden" name="post_id" defaultValue={comment.post_id} />
      <input type="hidden" name="user_id" defaultValue={comment.user_id} />
      <Button type="submit" name="save_comment" className="self-center">
        Save Comment
      </Button>
    </form>
    </>
  );
};

export const CommentCreate = (props) => {
  const params = useParams();
  const postId = parseInt(params?.postId, 10);
  const newComment = useMemo(() => ({ id: null, content: '', post_id: postId, user_id: null }), []);
  const commentForm = useCommentForm(newComment);
  
  return (
  <AppLayout
    header={
      <h2 className="font-semibold text-xl text-gray-800 leading-tight">
        <Link
          to={`/posts/${postId}`}
        >
          <Button type="button">
            {`Post #${postId}`}
          </Button>
        </Link> 
        &nbsp; 
        Create Comment
      </h2>
    }>
    <div className="py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            
      <CommentForm
        comment={commentForm.comment}
        validObj={commentForm.validObj}
        onSubmit={commentForm.handleSubmit}
        onContentChange={commentForm.handleContentChange}
      />
      
        </div>
      </div>
    </div>    
  </AppLayout>
  );  
};

const CommentEdit = (props) => {
  const isMounted = useMounted();
  const params = useParams();
  const commentGetSingle = useCommentGetSingle(parseInt(params.id, 10));
  const commentForm = useCommentForm(commentGetSingle.comment);
   
  if (commentForm.comment) {  
  return (
  <AppLayout
    header={
      <h2 className="font-semibold text-xl text-gray-800 leading-tight">
        <Link
          to={`/posts/${commentForm.comment?.post_id}`}
        >
          <Button type="button">
            {`Post #${commentForm.comment?.post_id}`}
          </Button>
        </Link> 
        &nbsp; 
        Edit Comment
      </h2>
    }>
    <div className="py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            
      <CommentForm
        comment={commentForm.comment}
        validObj={commentForm.validObj}
        onSubmit={commentForm.handleSubmit}
        onContentChange={commentForm.handleContentChange}
      />
      
        </div>
      </div>
    </div>    
  </AppLayout>
  );
  } else return (
    <NotFoundPage />
  ); 
};

export default CommentEdit;

