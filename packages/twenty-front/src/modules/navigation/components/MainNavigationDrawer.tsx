import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconSettings } from 'twenty-ui/display';
import { useIsMobile } from 'twenty-ui/utilities';
import styled from '@emotion/styled';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { MainNavigationDrawerFixedItems } from '@/navigation/components/MainNavigationDrawerFixedItems';
import { MainNavigationDrawerScrollableItems } from '@/navigation/components/MainNavigationDrawerScrollableItems';
import { SupportDropdown } from '@/support/components/SupportDropdown';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerExpandedMemorizedState } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedState';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';

const RedIconSettings = styled(IconSettings)`
  color: ${({ theme }) => theme.color.red};
`;

export const MainNavigationDrawer = ({ className }: { className?: string }) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLingui();

  const setNavigationMemorizedUrl = useSetRecoilState(navigationMemorizedUrlState);
  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useRecoilState(isNavigationDrawerExpandedState);
  const setNavigationDrawerExpandedMemorized = useSetRecoilState(
    navigationDrawerExpandedMemorizedState,
  );

  return (
    <NavigationDrawer
      className={className}
      title={currentWorkspace?.displayName ?? ''}
    >
      <NavigationDrawerFixedContent>
        <MainNavigationDrawerFixedItems />
      </NavigationDrawerFixedContent>

      <NavigationDrawerScrollableContent>
        <MainNavigationDrawerScrollableItems />
      </NavigationDrawerScrollableContent>

      <NavigationDrawerFixedContent>
        {!isMobile && (
          <NavigationDrawerItem
            label={t`Settings`}
            to={getSettingsPath(SettingsPath.ProfilePage)}
            onClick={() => {
              setNavigationDrawerExpandedMemorized(isNavigationDrawerExpanded);
              setIsNavigationDrawerExpanded(true);
              setNavigationMemorizedUrl(location.pathname + location.search);
              navigate(getSettingsPath(SettingsPath.ProfilePage));
            }}
            Icon={RedIconSettings}
          />
        )}
        <SupportDropdown />
      </NavigationDrawerFixedContent>
    </NavigationDrawer>
  );
};
