import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '~/test/utils';
import { LoginButton } from '../LoginButton';

// Mock Keycloak
const mockKeycloak = {
  login: vi.fn(),
};

vi.mock('../KeycloakProvider', () => ({
  useKeycloak: () => ({
    keycloak: mockKeycloak,
  }),
}));

describe('LoginButton', () => {
  it('renders login button with correct text', () => {
    render(<LoginButton />);
    
    expect(screen.getByRole('button', { name: /login with github/i })).toBeInTheDocument();
  });

  it('calls keycloak login when clicked', async () => {
    const user = userEvent.setup();
    render(<LoginButton />);
    
    const loginButton = screen.getByRole('button', { name: /login with github/i });
    await user.click(loginButton);
    
    expect(mockKeycloak.login).toHaveBeenCalledWith({
      idpHint: 'github',
    });
  });
});