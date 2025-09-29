// Location: client/src/context/FilterContext.jsx
// Global filter state management with support for both family-level and individual emotion filtering

import { createContext, useContext, useReducer, useCallback } from 'react';
import { createEmptyFilters, areFiltersEmpty } from '../utils/filterUtils';
import { emotionFamilies } from '../constants/emotions';

const FilterContext = createContext();

const FILTER_ACTIONS = {
  SET_EMOTION_FAMILIES: 'SET_EMOTION_FAMILIES',
  TOGGLE_EMOTION_FAMILY: 'TOGGLE_EMOTION_FAMILY',
  SET_EMOTIONS: 'SET_EMOTIONS',
  TOGGLE_EMOTION: 'TOGGLE_EMOTION',
  SELECT_ALL_IN_FAMILY: 'SELECT_ALL_IN_FAMILY',
  DESELECT_ALL_IN_FAMILY: 'DESELECT_ALL_IN_FAMILY',
  SET_INTENSITIES: 'SET_INTENSITIES',
  TOGGLE_INTENSITY: 'TOGGLE_INTENSITY',
  SET_DATE_RANGE: 'SET_DATE_RANGE',
  CLEAR_DATE_RANGE: 'CLEAR_DATE_RANGE',
  RESET_FILTERS: 'RESET_FILTERS',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGE_TYPE: 'SET_PAGE_TYPE'
};

const createInitialState = (pageType = 'home') => ({
  pageType,
  families: [],
  emotions: [], // Individual emotions (e.g., ["Happy", "Excited"])
  intensities: [],
  dateRange: {
    startDate: null,
    endDate: null
  },
  isFilterPanelOpen: false,
  hasActiveFilters: false
});

// Helper: Get all emotions in a family
const getEmotionsInFamily = (familyKey) => {
  const family = emotionFamilies[familyKey];
  return family ? family.emotions.map(e => e.label) : [];
};

// Helper: Check if all emotions in family are selected
const areAllEmotionsInFamilySelected = (familyKey, selectedEmotions) => {
  const familyEmotions = getEmotionsInFamily(familyKey);
  return familyEmotions.length > 0 && familyEmotions.every(e => selectedEmotions.includes(e));
};

// Helper: Check if some (but not all) emotions in family are selected
const areSomeEmotionsInFamilySelected = (familyKey, selectedEmotions) => {
  const familyEmotions = getEmotionsInFamily(familyKey);
  const selectedCount = familyEmotions.filter(e => selectedEmotions.includes(e)).length;
  return selectedCount > 0 && selectedCount < familyEmotions.length;
};

const filterReducer = (state, action) => {
  switch (action.type) {
    case FILTER_ACTIONS.TOGGLE_EMOTION_FAMILY: {
      const familyKey = action.payload;
      const familyEmotions = getEmotionsInFamily(familyKey);
      const allSelected = areAllEmotionsInFamilySelected(familyKey, state.emotions);
      
      let newEmotions;
      let newFamilies;
      
      if (allSelected) {
        // Deselect all emotions in this family
        newEmotions = state.emotions.filter(e => !familyEmotions.includes(e));
        newFamilies = state.families.filter(f => f !== familyKey);
      } else {
        // Select all emotions in this family
        newEmotions = [...new Set([...state.emotions, ...familyEmotions])];
        newFamilies = [...new Set([...state.families, familyKey])];
      }
      
      return {
        ...state,
        emotions: newEmotions,
        families: newFamilies,
        hasActiveFilters: !areFiltersEmpty({
          families: newFamilies,
          emotions: newEmotions,
          intensities: state.intensities,
          dateRange: state.dateRange
        })
      };
    }
    
    case FILTER_ACTIONS.TOGGLE_EMOTION: {
      const emotionLabel = action.payload;
      const isSelected = state.emotions.includes(emotionLabel);
      
      let newEmotions;
      if (isSelected) {
        newEmotions = state.emotions.filter(e => e !== emotionLabel);
      } else {
        newEmotions = [...state.emotions, emotionLabel];
      }
      
      // Update families based on emotion selections
      const newFamilies = Object.keys(emotionFamilies).filter(familyKey =>
        areAllEmotionsInFamilySelected(familyKey, newEmotions)
      );
      
      return {
        ...state,
        emotions: newEmotions,
        families: newFamilies,
        hasActiveFilters: !areFiltersEmpty({
          families: newFamilies,
          emotions: newEmotions,
          intensities: state.intensities,
          dateRange: state.dateRange
        })
      };
    }
    
    case FILTER_ACTIONS.SELECT_ALL_IN_FAMILY: {
      const familyKey = action.payload;
      const familyEmotions = getEmotionsInFamily(familyKey);
      const newEmotions = [...new Set([...state.emotions, ...familyEmotions])];
      const newFamilies = [...new Set([...state.families, familyKey])];
      
      return {
        ...state,
        emotions: newEmotions,
        families: newFamilies,
        hasActiveFilters: !areFiltersEmpty({
          families: newFamilies,
          emotions: newEmotions,
          intensities: state.intensities,
          dateRange: state.dateRange
        })
      };
    }
    
    case FILTER_ACTIONS.DESELECT_ALL_IN_FAMILY: {
      const familyKey = action.payload;
      const familyEmotions = getEmotionsInFamily(familyKey);
      const newEmotions = state.emotions.filter(e => !familyEmotions.includes(e));
      const newFamilies = state.families.filter(f => f !== familyKey);
      
      return {
        ...state,
        emotions: newEmotions,
        families: newFamilies,
        hasActiveFilters: !areFiltersEmpty({
          families: newFamilies,
          emotions: newEmotions,
          intensities: state.intensities,
          dateRange: state.dateRange
        })
      };
    }
    
    case FILTER_ACTIONS.SET_INTENSITIES:
      return {
        ...state,
        intensities: action.payload,
        hasActiveFilters: !areFiltersEmpty({
          families: state.families,
          emotions: state.emotions,
          intensities: action.payload,
          dateRange: state.dateRange
        })
      };
      
    case FILTER_ACTIONS.TOGGLE_INTENSITY: {
      const newIntensities = state.intensities.includes(action.payload)
        ? state.intensities.filter(i => i !== action.payload)
        : [...state.intensities, action.payload];
      
      return {
        ...state,
        intensities: newIntensities,
        hasActiveFilters: !areFiltersEmpty({
          families: state.families,
          emotions: state.emotions,
          intensities: newIntensities,
          dateRange: state.dateRange
        })
      };
    }
      
    case FILTER_ACTIONS.SET_DATE_RANGE:
      return {
        ...state,
        dateRange: action.payload,
        hasActiveFilters: !areFiltersEmpty({
          families: state.families,
          emotions: state.emotions,
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
          emotions: state.emotions,
          intensities: state.intensities,
          dateRange: { startDate: null, endDate: null }
        })
      };
      
    case FILTER_ACTIONS.RESET_FILTERS:
      return {
        ...state,
        families: [],
        emotions: [],
        intensities: [],
        dateRange: { startDate: null, endDate: null },
        hasActiveFilters: false
      };
      
    case FILTER_ACTIONS.SET_PAGE_TYPE:
      return {
        ...state,
        pageType: action.payload
      };
      
    default:
      return state;
  }
};

export const FilterProvider = ({ children, pageType = 'home' }) => {
  const [state, dispatch] = useReducer(filterReducer, createInitialState(pageType));

  const toggleEmotionFamily = useCallback((family) => {
    dispatch({ type: FILTER_ACTIONS.TOGGLE_EMOTION_FAMILY, payload: family });
  }, []);

  const toggleEmotion = useCallback((emotion) => {
    dispatch({ type: FILTER_ACTIONS.TOGGLE_EMOTION, payload: emotion });
  }, []);

  const selectAllInFamily = useCallback((familyKey) => {
    dispatch({ type: FILTER_ACTIONS.SELECT_ALL_IN_FAMILY, payload: familyKey });
  }, []);

  const deselectAllInFamily = useCallback((familyKey) => {
    dispatch({ type: FILTER_ACTIONS.DESELECT_ALL_IN_FAMILY, payload: familyKey });
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

  const setPageType = useCallback((pageType) => {
    dispatch({ type: FILTER_ACTIONS.SET_PAGE_TYPE, payload: pageType });
  }, []);

  const getCurrentFilters = useCallback(() => ({
    families: state.families,
    emotions: state.emotions,
    intensities: state.intensities,
    dateRange: state.dateRange
  }), [state.families, state.emotions, state.intensities, state.dateRange]);

  // Helper functions for emotion selection state
  const isEmotionSelected = useCallback((emotionLabel) => {
    return state.emotions.includes(emotionLabel);
  }, [state.emotions]);

  const isFamilyFullySelected = useCallback((familyKey) => {
    return areAllEmotionsInFamilySelected(familyKey, state.emotions);
  }, [state.emotions]);

  const isFamilyPartiallySelected = useCallback((familyKey) => {
    return areSomeEmotionsInFamilySelected(familyKey, state.emotions);
  }, [state.emotions]);

  const contextValue = {
    ...state,
    toggleEmotionFamily,
    toggleEmotion,
    selectAllInFamily,
    deselectAllInFamily,
    setIntensities,
    toggleIntensity,
    setDateRange,
    clearDateRange,
    resetFilters,
    setPageType,
    getCurrentFilters,
    isEmotionSelected,
    isFamilyFullySelected,
    isFamilyPartiallySelected
  };

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  
  if (context === undefined) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  
  return context;
};

export { FILTER_ACTIONS };