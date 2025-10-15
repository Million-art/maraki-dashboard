import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Material, CreateMaterialForm, UpdateMaterialForm, LoadingState } from '../../types';
import { materialsApi } from '../../services/api';

interface MaterialsState extends LoadingState {
  materials: Material[];
  selectedMaterial: Material | null;
  filters: {
    search: string;
    category: string;
    type: string;
    difficulty: string;
    status: string;
  };
}

const initialState: MaterialsState = {
  materials: [],
  selectedMaterial: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    category: '',
    type: '',
    difficulty: '',
    status: '',
  },
};

// Async thunks
export const fetchMaterials = createAsyncThunk(
  'materials/fetchMaterials',
  async (_, { rejectWithValue }) => {
    try {
      const response = await materialsApi.getAll();
      // Handle paginated response from backend
      if (response && typeof response === 'object' && 'materials' in response) {
        return (response as any).materials;
      }
      // Fallback for direct array response
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch materials');
    }
  }
);

export const fetchMaterialById = createAsyncThunk(
  'materials/fetchMaterialById',
  async (id: string, { rejectWithValue }) => {
    try {
      const material = await materialsApi.getById(id);
      return material;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch material');
    }
  }
);

export const createMaterial = createAsyncThunk(
  'materials/createMaterial',
  async (materialData: CreateMaterialForm, { rejectWithValue }) => {
    try {
      const material = await materialsApi.create(materialData);
      return material;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create material');
    }
  }
);

export const updateMaterial = createAsyncThunk(
  'materials/updateMaterial',
  async ({ id, materialData }: { id: string; materialData: UpdateMaterialForm }, { rejectWithValue }) => {
    try {
      const material = await materialsApi.update(id, materialData);
      return material;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update material');
    }
  }
);

export const deleteMaterial = createAsyncThunk(
  'materials/deleteMaterial',
  async (id: string, { rejectWithValue }) => {
    try {
      await materialsApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete material');
    }
  }
);

const materialsSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {
    setSelectedMaterial: (state, action: PayloadAction<Material | null>) => {
      state.selectedMaterial = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<MaterialsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch materials
      .addCase(fetchMaterials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materials = action.payload;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch material by ID
      .addCase(fetchMaterialById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMaterialById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedMaterial = action.payload;
      })
      .addCase(fetchMaterialById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create material
      .addCase(createMaterial.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMaterial.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materials.unshift(action.payload);
      })
      .addCase(createMaterial.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update material
      .addCase(updateMaterial.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMaterial.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.materials.findIndex(material => material.id === action.payload.id);
        if (index !== -1) {
          state.materials[index] = action.payload;
        }
        if (state.selectedMaterial?.id === action.payload.id) {
          state.selectedMaterial = action.payload;
        }
      })
      .addCase(updateMaterial.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete material
      .addCase(deleteMaterial.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materials = state.materials.filter(material => material.id !== action.payload);
        if (state.selectedMaterial?.id === action.payload) {
          state.selectedMaterial = null;
        }
      })
      .addCase(deleteMaterial.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedMaterial, setFilters, clearError } = materialsSlice.actions;
export default materialsSlice.reducer;
