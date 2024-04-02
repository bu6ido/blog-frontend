import { Link, NavLink } from 'react-router-dom';

const Pagination = (props) => {
  const { count, page, rowsPerPage, rowsPerPageOptions = [], onPageChange, onRowsPerPageChange } = props;
  const maxPage = (rowsPerPage > 0)? Math.ceil(count / rowsPerPage) : 0;
  
  return (
  <div>
    <div>
      Rows per page: 
      <select 
        value={rowsPerPage}
        onChange={(e) => onRowsPerPageChange(e)}>
        {rowsPerPageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
    <div>
      <Link onClick={(e) => onPageChange(e, 1)} className={(page <= 1)? 'pointer-events-none ' : 'underline '}>First</Link>
      &nbsp;
      <Link onClick={(e) => onPageChange(e, page - 1)} className={(page <= 1)? 'pointer-events-none ' : 'underline '}>Previous</Link>
      &nbsp;
      <span>{page}</span>
      &nbsp;
      <Link onClick={(e) => onPageChange(e, page + 1)} className={(page >= maxPage)? 'pointer-events-none ' : 'underline '}>Next</Link>
      &nbsp;
      <Link onClick={(e) => onPageChange(e, maxPage)} className={(page >= maxPage)? 'pointer-events-none ' : 'underline '}>Last</Link>
    </div>
  </div>
  );
};

export default Pagination
