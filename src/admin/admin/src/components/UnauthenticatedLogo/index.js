import React from 'react';
import styled from 'styled-components';
import { useConfigurations } from '../../hooks';

const Img = styled.img`
  height: 10rem;
`;

const Logo = () => {
  const {
    logos: { auth },
  } = useConfigurations();

  return <Img src={auth.default} aria-hidden alt="" />;
};

export default Logo;
