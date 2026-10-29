// All changes to the workspace go through this one function.
//
// It is pure (no storage, no clock, no random ids), which makes it easy to test.
// Ids and timestamps are created before an action is dispatched, see
// WorkspaceProvider. The reducer only decides how the data changes.

import { createEmptyWorkspace } from './workspaceSchema.js'

// How many posts and follow-ups belong to a brand (shown before deleting it).
export function countBrandRecords(data, brandId) {
  return {
    posts: data.posts.filter((post) => post.brandId === brandId).length,
    interactions: data.interactions.filter((item) => item.brandId === brandId).length,
  }
}

export function countSampleRecords(data) {
  return (
    data.brands.filter((item) => item.isSample).length +
    data.posts.filter((item) => item.isSample).length +
    data.interactions.filter((item) => item.isSample).length
  )
}

export function workspaceReducer(state, action) {
  switch (action.type) {
    case 'workspace/rename':
      return { ...state, workspaceName: action.name }

    case 'workspace/replace':
      return action.data

    case 'workspace/clear':
      return { ...createEmptyWorkspace(), workspaceName: state.workspaceName }

    // Removes only the demonstration records. Anything the person created stays,
    // and if it pointed at a sample brand it moves to "General workspace".
    case 'workspace/removeSample': {
      const removedBrandIds = new Set(state.brands.filter((brand) => brand.isSample).map((brand) => brand.id))
      const detach = (record) => (removedBrandIds.has(record.brandId) ? { ...record, brandId: '' } : record)
      return {
        ...state,
        brands: state.brands.filter((brand) => !brand.isSample),
        posts: state.posts.filter((post) => !post.isSample).map(detach),
        interactions: state.interactions.filter((item) => !item.isSample).map(detach),
      }
    }

    case 'brand/add':
      return { ...state, brands: [action.brand, ...state.brands] }

    case 'brand/update':
      return {
        ...state,
        brands: state.brands.map((brand) => (brand.id === action.id ? { ...brand, ...action.changes } : brand)),
      }

    // By default a deleted brand's posts and follow-ups are kept and moved to
    // "General workspace". With removeRecords they are deleted with it.
    case 'brand/delete': {
      const detach = (record) => (record.brandId === action.id ? { ...record, brandId: '' } : record)
      return {
        ...state,
        brands: state.brands.filter((brand) => brand.id !== action.id),
        posts: action.removeRecords
          ? state.posts.filter((post) => post.brandId !== action.id)
          : state.posts.map(detach),
        interactions: action.removeRecords
          ? state.interactions.filter((item) => item.brandId !== action.id)
          : state.interactions.map(detach),
      }
    }

    case 'post/add':
      return { ...state, posts: [action.post, ...state.posts] }

    case 'post/update':
      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === action.id ? { ...post, ...action.changes, updatedAt: action.updatedAt } : post,
        ),
      }

    case 'post/delete':
      return { ...state, posts: state.posts.filter((post) => post.id !== action.id) }

    case 'interaction/add':
      return { ...state, interactions: [action.interaction, ...state.interactions] }

    case 'interaction/update':
      return {
        ...state,
        interactions: state.interactions.map((item) =>
          item.id === action.id ? { ...item, ...action.changes } : item,
        ),
      }

    case 'interaction/delete':
      return { ...state, interactions: state.interactions.filter((item) => item.id !== action.id) }

    default:
      return state
  }
}
