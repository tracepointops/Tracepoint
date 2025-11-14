import styled from '@emotion/styled';
import React from 'react';
import { AnimatedEaseIn } from 'twenty-ui/utilities';

type TitleProps = React.PropsWithChildren & {
  animate?: boolean;
  noMarginTop?: boolean;
};

const StyledTitle = styled.div<Pick<TitleProps, 'noMarginTop'>>`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme, noMarginTop }) =>
    !noMarginTop ? theme.spacing(4) : 0};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const StyledFullLogo = styled.img`
  height: auto;
  width: 90%;
  max-width: 90%;
  display: block;
`;

export const Title = ({
  children,
  animate = false,
  noMarginTop = false,
}: TitleProps) => {
  const content = (
    <StyledFullLogo
      src="/images/logos/swanson logo full (1) (1).png"
      alt="Swanson Industries"
    />
  );

  if (animate) {
    return (
      <StyledTitle noMarginTop={noMarginTop}>
        <AnimatedEaseIn>{content}</AnimatedEaseIn>
      </StyledTitle>
    );
  }

  return <StyledTitle noMarginTop={noMarginTop}>{content}</StyledTitle>;
};
