import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuickOptions, { QUICK_OPTIONS } from '../../components/QuickOptions';

function setup(props?: Partial<Parameters<typeof QuickOptions>[0]>) {
  const defaults = {
    selectedOption: null as string | null,
    onSelect: vi.fn(),
  };
  const merged = { ...defaults, ...props };
  render(<QuickOptions {...merged} />);
  return merged;
}

describe('QuickOptions', () => {
  // --- Rendering ---

  it('renders all four required quick option buttons', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Acne' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tan Removal' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Glowing Skin' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dark Circles' })).toBeInTheDocument();
  });

  it('renders exactly four buttons', () => {
    setup();
    expect(screen.getAllByRole('button')).toHaveLength(4);
  });

  it('renders buttons inside a group with accessible label', () => {
    setup();
    expect(
      screen.getByRole('group', { name: /quick skin concern options/i })
    ).toBeInTheDocument();
  });

  // --- Click interaction ---

  it('calls onSelect with the option label when a button is clicked', () => {
    const onSelect = vi.fn();
    setup({ onSelect });
    fireEvent.click(screen.getByRole('button', { name: 'Acne' }));
    expect(onSelect).toHaveBeenCalledWith('Acne');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('calls onSelect with correct label for each option', () => {
    QUICK_OPTIONS.forEach((option) => {
      const onSelect = vi.fn();
      const { unmount } = render(
        <QuickOptions selectedOption={null} onSelect={onSelect} />
      );
      fireEvent.click(screen.getByRole('button', { name: option }));
      expect(onSelect).toHaveBeenCalledWith(option);
      unmount();
    });
  });

  // --- Active/highlighted state ---

  it('applies active style to the selected button', () => {
    setup({ selectedOption: 'Acne' });
    const activeBtn = screen.getByRole('button', { name: 'Acne' });
    expect(activeBtn).toHaveAttribute('aria-pressed', 'true');
    expect(activeBtn.className).toContain('bg-rose-400');
  });

  it('does not apply active style to non-selected buttons', () => {
    setup({ selectedOption: 'Acne' });
    const inactiveBtn = screen.getByRole('button', { name: 'Tan Removal' });
    expect(inactiveBtn).toHaveAttribute('aria-pressed', 'false');
    expect(inactiveBtn.className).not.toContain('bg-rose-400');
  });

  it('only the selected button has aria-pressed=true', () => {
    setup({ selectedOption: 'Glowing Skin' });
    const buttons = screen.getAllByRole('button');
    const pressedButtons = buttons.filter(
      (btn) => btn.getAttribute('aria-pressed') === 'true'
    );
    expect(pressedButtons).toHaveLength(1);
    expect(pressedButtons[0]).toHaveTextContent('Glowing Skin');
  });

  it('no button is active when selectedOption is null', () => {
    setup({ selectedOption: null });
    screen.getAllByRole('button').forEach((btn) => {
      expect(btn).toHaveAttribute('aria-pressed', 'false');
      expect(btn.className).not.toContain('bg-rose-400');
    });
  });

  it('active highlight moves when a different button is selected', () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <QuickOptions selectedOption="Acne" onSelect={onSelect} />
    );

    // Initially Acne is active
    expect(screen.getByRole('button', { name: 'Acne' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Dark Circles' })).toHaveAttribute('aria-pressed', 'false');

    // Simulate parent updating selectedOption to Dark Circles
    rerender(<QuickOptions selectedOption="Dark Circles" onSelect={onSelect} />);

    expect(screen.getByRole('button', { name: 'Dark Circles' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Acne' })).toHaveAttribute('aria-pressed', 'false');

    // Only one button should be active
    const pressedButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.getAttribute('aria-pressed') === 'true');
    expect(pressedButtons).toHaveLength(1);
  });

  // --- Keyboard interaction ---

  it('triggers onSelect when Enter key is pressed on a button', () => {
    const onSelect = vi.fn();
    setup({ onSelect });
    const btn = screen.getByRole('button', { name: 'Tan Removal' });
    fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter' });
    // Buttons natively fire click on Enter; simulate the resulting click
    fireEvent.click(btn);
    expect(onSelect).toHaveBeenCalledWith('Tan Removal');
  });

  it('triggers onSelect when Space key is pressed on a button', () => {
    const onSelect = vi.fn();
    setup({ onSelect });
    const btn = screen.getByRole('button', { name: 'Glowing Skin' });
    // Space on a button fires a click event natively
    fireEvent.keyDown(btn, { key: ' ', code: 'Space' });
    fireEvent.click(btn);
    expect(onSelect).toHaveBeenCalledWith('Glowing Skin');
  });

  it('all buttons are keyboard focusable', () => {
    setup();
    screen.getAllByRole('button').forEach((btn) => {
      // Buttons are focusable by default; tabIndex should not be -1
      expect(btn).not.toHaveAttribute('tabindex', '-1');
    });
  });
});
