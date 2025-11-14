import styled from '@emotion/styled';
import { AppPath } from 'twenty-shared/types';
import { getImageAbsoluteURI, isDefined } from 'twenty-shared/utils';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useRedirectToDefaultDomain } from '~/modules/domain-manager/hooks/useRedirectToDefaultDomain';

type LogoProps = {
  primaryLogo?: string | null;
  secondaryLogo?: string | null;
  placeholder?: string | null;
  onClick?: () => void;
};

const StyledContainer = styled.div`
  border-radius: 12px;
  color: ${({ theme }) => theme.color.tracepointAmber};
  height: ${({ theme }) => theme.spacing(40)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
  width: ${({ theme }) => theme.spacing(75)};
`;

const StyledPrimaryLogo = styled.div<{ src: string }>`
  background: url(${(props) => props.src});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  height: 100%;
  width: 100%;
`;

export const Logo = ({
  primaryLogo,
  secondaryLogo: _secondaryLogo,
  placeholder: _placeholder,
  onClick,
}: LogoProps) => {
  const { redirectToDefaultDomain } = useRedirectToDefaultDomain();
  const defaultPrimaryLogoUrl = `${window.location.origin}/images/logos/Tracepoint-logo2.png`;

  const primaryLogoUrl = getImageAbsoluteURI({
    imageUrl: primaryLogo ?? defaultPrimaryLogoUrl,
    baseUrl: REACT_APP_SERVER_BASE_URL,
  });

  const isUsingDefaultLogo = !isDefined(primaryLogo);

  return (
    <StyledContainer onClick={() => onClick?.()}>
      {isUsingDefaultLogo ? (
        <UndecoratedLink
          to={AppPath.SignInUp}
          onClick={redirectToDefaultDomain}
        >
          <StyledPrimaryLogo src={primaryLogoUrl} />
        </UndecoratedLink>
      ) : (
        <StyledPrimaryLogo src={primaryLogoUrl} />
      )}
    </StyledContainer>
  );
};
