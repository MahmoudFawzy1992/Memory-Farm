// Global filter state management for memory filtering across pages
import { createContext, useContext, useReducer, useCallback } from 'react';
import { createEmptyFilters, areFiltersEmpty } from '../utils/filterUtils';

const FilterContext = createContext();

// Filter action types
const FILTER_ACTIONS = {
  SET_EMOTION_FAMILIES: 'SET_EMOTION_FAMILIES',
  TOGGLE_EMOTION_FAMILY: 'TOGGLE_EMOTION_FAMILY',
  SET_INTENSITIES: 'SET_INTENSITIES',
  TOGGLE_INTENSITY: 'TOGGLE_INTENSITY',
  SET_DATE_RANGE: 'SET_DATE_RANGE',
  CLEAR_DATE_RANGE: 'CLEAR_DATE_RANGE',
  RESET_FILTERS: 'RESET_FILTERS',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGE_TYPE: 'SET_PAGE_TYPE'
};

// Initial state factory - different defaults per page
const createInitialState = (pageType = 'home') => ({
  // Current page context (home, discover, moodTracker)
  pageType,
  
  // Filter values
  families: [],
  intensities: [],
  dateRange: {
    startDate: null,
    endDate: null
  },
  
  // UI state
  isFilterPanelOpen: false,
  hasActiveFilters: false
});

// Filter reducer
const filterReducer = (state, action) => {
  switch (action.type) {
    case FILTER_ACTIONS.SET_EMOTION_FAMILIES:
      return {
        ...state,
        families: action.payload,
        hasActiveFilters: !areFiltersEmpty({
          families: action.payload,
          intensities: state.intensities,
          dateRange: state.dateRange
        })
      };
      
    case FILTER_ACTIONS.TOGGLE_EMOTION_FAMILY:
      const newFamilies = state.families.includes(action.payload)
        ? state.families.filter(f => f !== action.payload)
        : [...state.families, action.payload];
      
      return {
        ...state,
        families: newFamilies,
        hasActiveFilters: !areFiltersEmpty({
          families: newFamilies,
          intensities: state.intensities,
          dateRange: state.dateRange
        })
      };
      
    case FILTER_ACTIONS.SET_INTENSITIES:
      return {
        ...state,
        intensities: action.payload,
        hasActiveFilters: !areFiltersEmpty({
          families: state.families,
          intensities: action.payload,
          dateRange: state.dateRange
        })
      };
      
    case FILTER_ACTIONS.TOGGLE_INTENSITY:
      const newIntensities = state.intensities.includes(action.payload)
        ? state.intensities.filter(i => i !== action.payload)
        : [...state.intensities, action.payload];
      
      return {
        ...state,
        intensities: newIntensities,
        hasActiveFilters: !areFiltersEmpty({
          families: state.families,
          intensities: newIntensities,
          dateRange: state.dateRange
        })
      };
      
    case FILTER_ACTIONS.SET_DATE_RANGE:
      return {
        ...state,
        dateRange: action.payload,
        hasActiveFilters: !areFiltersEmpty({
          families: state.families,
          intensities: state.intensities,
          dateRange: action.payload
        })
      };
      
    case FILTER_ACTIONS.CLEAR_DATE_RANGE:
      return {
        ...state,
        dateRange: { startDate: null, endDate: null },
        hasActiveFilters: !areFiltersEmpty({
          families: state.families,
          intensities: state.intensities,
          dateRange: { startDate: null, endDate: null }
        })
      };
      
    case FILTER_ACTIONS.RESET_FILTERS:
      const emptyFilters = createEmptyFilters();
      return {
        ...state,
        families: emptyFilters.families,
        intensities: emptyFilters.intensities,
        dateRange: emptyFilters.dateRange,
        hasActiveFilters: false
      };
      
    case FILTER_ACTIONS.SET_FILTERS:
      return {
        ...state,
        families: action.payload.families || [],
        intensities: action.payload.intensities || [],
        dateRange: action.payload.dateRange || { startDate: null, endDate: null },
        hasActiveFilters: !areFiltersEmpty(action.payload)
      };
      
    case FILTER_ACTIONS.SET_PAGE_TYPE:
      // When switching pages, maintain filters but update context
      return {
        ...state,
        pageType: action.payload
      };
      
    default:
      return state;
  }
};

/**
 * Filter Context Provider Component
 * Manages global filter state across all pages
 */
export const FilterProvider = ({ children, pageType = 'home' }) => {
  const [state, dispatch] = useReducer(
    filterReducer, 
    createInitialState(pageType)
  );

  // Action creators wrapped in useCallback for performance
  const setEmotionFamilies = useCallback((families) => {
    dispatch({ type: FILTER_ACTIONS.SET_EMOTION_FAMILIES, payload: families });
  }, []);

  const toggleEmotionFamily = useCallback((family) => {
    dispatch({ type: FILTER_ACTIONS.TOGGLE_EMOTION_FAMILY, payload: family });
  }, []);

  const setIntensities = useCallback((intensities) => {
    dispatch({ type: FILTER_ACTIONS.SET_INTENSITIES, payload: intensities });
  }, []);

  const toggleIntensity = useCallback((intensity) => {
    dispatch({ type: FILTER_ACTIONS.TOGGLE_INTENSITY, payload: intensity });
  }, []);

  const setDateRange = useCallback((dateRange) => {
    dispatch({ type: FILTER_ACTIONS.SET_DATE_RANGE, payload: dateRange });
  }, []);

  const clearDateRange = useCallback(() => {
    dispatch({ type: FILTER_ACTIONS.CLEAR_DATE_RANGE });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: FILTER_ACTIONS.RESET_FILTERS });
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: FILTER_ACTIONS.SET_FILTERS, payload: filters });
  }, []);

  const setPageType = useCallback((pageType) => {
    dispatch({ type: FILTER_ACTIONS.SET_PAGE_TYPE, payload: pageType });
  }, []);

  // Get current filters as plain object
  const getCurrentFilters = useCallback(() => ({
    families: state.families,
    intensities: state.intensities,
    dateRange: state.dateRange
  }), [state.families, state.intensities, state.dateRange]);

  // Context value object
  const contextValue = {
    // State
    ...state,
    
    // Actions
    setEmotionFamilies,
    toggleEmotionFamily,
    setIntensities,
    toggleIntensity,
    setDateRange,
    clearDateRange,
    resetFilters,
    setFilters,
    setPageType,
    getCurrentFilters
  };

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};

/**
 * Hook to use filter context
 * Provides filter state and actions to components
 */
export const useFilterContext = () => {
  const context = useContext(FilterContext);
  
  if (context === undefined) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  
  return context;
};

// Export action types for external use if needed
export { FILTER_ACTIONS };