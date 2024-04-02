import { useState, useCallback } from 'react';
//import { storageSet } from 'src/libs/common';

export const useTableCommonSearch = (initialTableState = {}) => {
  const { viewName } = initialTableState;
  const [state, setState] = useState(initialTableState);

  const handleFiltersChange = useCallback((filters) => {
    setState((prevState) => ({
      ...prevState,
      filters,
      page: 1,
    }));
  }, []);

  const handleSortChange = useCallback((sort) => {
    setState((prevState) => ({
      ...prevState,
      sortBy: sort.sortBy,
      sortDir: sort.sortDir,
      page: 1,
    }));
    
//    storageSet(viewName + '.sortBy', sort.sortBy);
//    storageSet(viewName + '.sortDir', sort.sortDir);
  }, []);

  const handlePageChange = useCallback((event, page) => {
    setState((prevState) => ({
      ...prevState,
      page,
    }));
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setState((prevState) => ({
      ...prevState,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 1,
    }));
    
//    storageSet(viewName + '.rowsPerPage', parseInt(event.target.value, 10));
  }, []);

  const handleVisibleColumnsChange = useCallback((newColumns) => {
    setState((prevState) => ({
      ...prevState,
      visibleColumns: newColumns,
    }));
    
//    storageSet(viewName + '.visibleColumns', newColumns);
  }, []);

  return {
    handleFiltersChange,
    handleSortChange,
    handlePageChange,
    handleRowsPerPageChange,
    handleVisibleColumnsChange,
    state,
  };
};
