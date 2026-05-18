import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('lets a new player tap Ym and open the Lab', async () => {
    render(<App />);

    expect(screen.getByTestId('spark-value')).toHaveTextContent('0');

    fireEvent.click(screen.getByRole('button', { name: 'Tap Ym' }));
    expect(screen.getByTestId('spark-value')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: 'Lab' }));
    expect(screen.getByRole('heading', { name: 'Growth Lab' })).toBeVisible();
  });
});
