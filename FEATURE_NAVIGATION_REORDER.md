# Feature: Admin Navigation Reordering

## Overview
Allow workspace admins to reorder navigation items via drag-and-drop. When enabled, shows a reorder mode toggle button above Settings that lets admins rearrange workspace objects. The new order applies to all workspace users.

## User Experience

### Activation
1. Admin goes to Settings → Developers → Enable "Navigation Reorder Mode" toggle
2. A "Reorder Navigation" button appears above Settings in the left sidebar
3. Click button to enter reorder mode
4. Navigation links become non-clickable, draggable handles appear
5. Drag items to reorder, changes save automatically
6. Click button again to exit reorder mode

### Technical Specs

**Complexity:** Medium (3-4 hours)
- Requires workspace-level settings storage
- Drag-and-drop library integration
- Permission checks
- UI state management

## Implementation Steps

### 1. Backend: Add Workspace Navigation Order Setting

**File:** `/packages/twenty-server/src/engine/core-modules/workspace/workspace.entity.ts`

Add field to store navigation order:
```typescript
@Column({ type: 'jsonb', nullable: true })
navigationOrder?: string[]; // Array of objectMetadataItem IDs in display order
```

**Migration:** Create migration to add `navigationOrder` column

### 2. Frontend: Feature Flag State

**File:** `/packages/twenty-front/src/modules/navigation/states/isNavigationReorderModeEnabledState.ts`
```typescript
import { atom } from 'recoil';

export const isNavigationReorderModeEnabledState = atom<boolean>({
  key: 'isNavigationReorderModeEnabledState',
  default: false,
});
```

**File:** `/packages/twenty-front/src/modules/navigation/states/isNavigationReorderModeActiveState.ts`
```typescript
import { atom } from 'recoil';

export const isNavigationReorderModeActiveState = atom<boolean>({
  key: 'isNavigationReorderModeActiveState',
  default: false,
});
```

### 3. Settings Toggle Component

**File:** `/packages/twenty-front/src/pages/settings/developers/SettingsDevelopers.tsx`

Add toggle in developer settings:
```typescript
<SettingsPageContainer>
  <Section>
    <H2Title title="Developer Features" />

    {/* Existing toggles... */}

    <SettingsOptionCardContent
      Icon={IconArrowsSort}
      title="Navigation Reorder Mode"
      description="Enable drag-and-drop reordering of navigation items (Admin only)"
      divider
    >
      <Toggle
        value={isNavigationReorderModeEnabled}
        onChange={handleToggleNavigationReorderMode}
      />
    </SettingsOptionCardContent>
  </Section>
</SettingsPageContainer>
```

### 4. Reorder Mode Toggle Button

**File:** `/packages/twenty-front/src/modules/navigation/components/NavigationReorderModeButton.tsx`

```typescript
import { IconArrowsSort } from 'twenty-ui/display';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isNavigationReorderModeActiveState } from '@/navigation/states/isNavigationReorderModeActiveState';
import { isNavigationReorderModeEnabledState } from '@/navigation/states/isNavigationReorderModeEnabledState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';

export const NavigationReorderModeButton = () => {
  const [isActive, setIsActive] = useRecoilState(isNavigationReorderModeActiveState);
  const isEnabled = useRecoilValue(isNavigationReorderModeEnabledState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  // Only show for admins when feature is enabled
  if (!isEnabled || !currentWorkspaceMember?.isAdmin) {
    return null;
  }

  return (
    <NavigationDrawerItem
      label={isActive ? "Exit Reorder Mode" : "Reorder Navigation"}
      onClick={() => setIsActive(!isActive)}
      Icon={IconArrowsSort}
      active={isActive}
    />
  );
};
```

### 5. Update MainNavigationDrawer

**File:** `/packages/twenty-front/src/modules/navigation/components/MainNavigationDrawer.tsx`

```typescript
import { NavigationReorderModeButton } from '@/navigation/components/NavigationReorderModeButton';

// Inside NavigationDrawerFixedContent, before Settings:
<NavigationDrawerFixedContent>
  <NavigationReorderModeButton />  {/* Add this */}

  {!isMobile && (
    <NavigationDrawerItem
      label={t`Settings`}
      // ... existing settings code
    />
  )}
  <SupportDropdown />
</NavigationDrawerFixedContent>
```

### 6. Drag-and-Drop Implementation

**Install library:**
```bash
cd packages/twenty-front
yarn add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**File:** `/packages/twenty-front/src/modules/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems.tsx`

Update to support drag-and-drop:
```typescript
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { isNavigationReorderModeActiveState } from '@/navigation/states/isNavigationReorderModeActiveState';

// Wrap NavigationDrawerItemForObjectMetadataItem with sortable
const SortableNavigationItem = ({ item, isReorderMode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id, disabled: !isReorderMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <NavigationDrawerItemForObjectMetadataItem
        objectMetadataItem={item}
        disabled={isReorderMode} // Prevent navigation in reorder mode
      />
    </div>
  );
};

export const NavigationDrawerSectionForObjectMetadataItems = ({
  sectionTitle,
  isRemote,
  objectMetadataItems,
}: NavigationDrawerSectionForObjectMetadataItemsProps) => {
  const isReorderMode = useRecoilValue(isNavigationReorderModeActiveState);
  const [items, setItems] = useState(objectMetadataItems);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Save to backend
        updateWorkspaceNavigationOrder(newOrder.map(item => item.id));

        return newOrder;
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label={sectionTitle} />

        <SortableContext
          items={items.map(item => item.id)}
          strategy={verticalListSingStrategy}
        >
          {items.map((item) => (
            <SortableNavigationItem
              key={item.id}
              item={item}
              isReorderMode={isReorderMode}
            />
          ))}
        </SortableContext>
      </NavigationDrawerSection>
    </DndContext>
  );
};
```

### 7. GraphQL Mutation for Saving Order

**File:** `/packages/twenty-front/src/modules/workspace/graphql/mutations/updateWorkspaceNavigationOrder.ts`

```graphql
export const UPDATE_WORKSPACE_NAVIGATION_ORDER = gql`
  mutation UpdateWorkspaceNavigationOrder($navigationOrder: [String!]!) {
    updateWorkspace(data: { navigationOrder: $navigationOrder }) {
      id
      navigationOrder
    }
  }
`;
```

**Hook:** `/packages/twenty-front/src/modules/workspace/hooks/useUpdateWorkspaceNavigationOrder.ts`
```typescript
import { useMutation } from '@apollo/client';
import { UPDATE_WORKSPACE_NAVIGATION_ORDER } from '../graphql/mutations/updateWorkspaceNavigationOrder';

export const useUpdateWorkspaceNavigationOrder = () => {
  const [updateMutation] = useMutation(UPDATE_WORKSPACE_NAVIGATION_ORDER);

  return (navigationOrder: string[]) => {
    return updateMutation({
      variables: { navigationOrder },
    });
  };
};
```

### 8. Visual Feedback for Reorder Mode

**File:** `/packages/twenty-front/src/modules/navigation/components/NavigationDrawerItemForObjectMetadataItem.tsx`

Add visual indicator when in reorder mode:
```typescript
const StyledDragHandle = styled.div`
  opacity: ${({ isReorderMode }) => (isReorderMode ? 1 : 0)};
  cursor: ${({ isReorderMode }) => (isReorderMode ? 'grab' : 'default')};
  transition: opacity 0.2s;
`;
```

## Testing Checklist

- [ ] Feature toggle appears in Settings → Developers
- [ ] Reorder button only visible to admins when toggle enabled
- [ ] Clicking reorder button disables navigation
- [ ] Drag handles appear in reorder mode
- [ ] Items can be dragged and dropped
- [ ] Order persists after page reload
- [ ] Order applies to all workspace users
- [ ] Non-admin users cannot access reorder mode
- [ ] Mobile responsive (reorder disabled on mobile)

## Alternative: Simpler Implementation (1-2 hours)

If you want a quicker MVP without developer settings:

1. **Admin-only button:** Show reorder button for admins automatically
2. **localStorage only:** Store order in browser localStorage (per-user, not workspace-wide)
3. **No backend:** Skip database/GraphQL (temporary solution)
4. **Simple state:** Use useState instead of Recoil

Would you like me to implement the full version or the simpler MVP first?
