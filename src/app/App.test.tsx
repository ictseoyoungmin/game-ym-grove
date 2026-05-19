import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { createInitialState } from '../game/state';
import { useGameStore } from '../store/gameStore';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.setState(createInitialState(Date.now()));
  });

  it('lets a new player tap Ym and open the Lab', async () => {
    render(<App />);

    expect(screen.getByTestId('spark-value')).toHaveTextContent('0');

    fireEvent.click(screen.getByRole('button', { name: 'Tap Ym' }));
    expect(screen.getByTestId('spark-value')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: 'Lab' }));
    expect(screen.getByRole('heading', { name: 'Growth Lab' })).toBeVisible();
  });

  it('opens locked Collection hints and resets from Settings', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Collection' }));
    fireEvent.click(screen.getByTestId('collection-card-ai-agents'));
    expect(screen.getByRole('dialog', { name: 'Collection detail' })).toHaveTextContent('Locked Ym');

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset Game' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Reset' }));

    fireEvent.click(screen.getByRole('button', { name: 'Grove' }));
    expect(screen.getByTestId('spark-value')).toHaveTextContent('0');
  });
});
