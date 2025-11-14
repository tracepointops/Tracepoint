import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { useOpenRecordsSearchPageInCommandMenu } from '@/command-menu/hooks/useOpenRecordsSearchPageInCommandMenu';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerExpandedMemorizedState } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedState';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconSearch, IconSettings, IconSparkles } from 'twenty-ui/display';
import { useIsMobile } from 'twenty-ui/utilities';
import { FeatureFlagKey } from '~/generated/graphql';
import styled from '@emotion/styled';

const BlueIconSearch = styled(IconSearch)`
  color: ${({ theme }) => theme.color.sky};
`;

const PurpleIconSparkles = styled(IconSparkles)`
  color: ${({ theme }) => theme.color.violet};
`;

export const MainNavigationDrawerFixedItems = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useRecoilState(isNavigationDrawerExpandedState);
  const setNavigationDrawerExpandedMemorized = useSetRecoilState(
    navigationDrawerExpandedMemorizedState,
  );

  const navigate = useNavigate();

  const { t } = useLingui();

  const { openRecordsSearchPage } = useOpenRecordsSearchPageInCommandMenu();
  const { openAskAIPage } = useOpenAskAIPageInCommandMenu();
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  return (
    !isMobile && (
      <>
        <NavigationDrawerItem
          label={t`Search`}
          Icon={BlueIconSearch}
          onClick={openRecordsSearchPage}
          keyboard={['/']}
          mouseUpNavigation={true}
        />
        {isAiEnabled && (
          <NavigationDrawerItem
            label={t`Ask AI`}
            Icon={PurpleIconSparkles}
            onClick={() => openAskAIPage()}
            keyboard={['@']}
            mouseUpNavigation={true}
          />
        )}
      </>
    )
  );
};
