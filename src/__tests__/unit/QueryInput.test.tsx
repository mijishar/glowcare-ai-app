import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import QueryInput from '../../components/QueryInput';

function setup(props?: Partial<Parameters<typeof QueryInput>[0]>) {
  const defaults = {
    value: '',
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    isLoading: false,
  };
  const merged = { ...defaults, ...props };
  render(<QueryInput {...merged} />);
  return merged;
}

describe('QueryInput', () => {
  it('renders textarea and submit button', () => {
    setup();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit skin concern/i })).toBeInTheDocument();
  });

  it('calls onChange when user types', async () => {
    const onChange = vi.fn();
    setup({ onChange });
    await userEvent.type(screen.getByRole('textbox'), 'oily skin');
    expect(onChange).toHaveBeenCalled();
  });

  it('shows validation error when submitting empty input', () => {
    const onSubmit = vi.fn();
    setup({ value: '', onSubmit });
    fireEvent.click(screen.getByRole('button', { name: /submit skin concern/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Please describe your skin concern before submitting.'
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error when submitting whitespace-only input', () => {
    const onSubmit = vi.fn();
    setup({ value: '   ', onSubmit });
    fireEvent.click(screen.getByRole('button', { name: /submit skin concern/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with value when input is non-empty', () => {
    const onSubmit = vi.fn();
    setup({ value: 'dry skin', onSubmit });
    fireEvent.click(screen.getByRole('button', { name: /submit skin concern/i }));
    expect(onSubmit).toHaveBeenCalledWith('dry skin');
  });

  it('clears validation error when user starts typing', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <QueryInput value="" onChange={onChange} onSubmit={vi.fn()} isLoading={false} />
    );
    // Trigger validation error
    fireEvent.click(screen.getByRole('button', { name: /submit skin concern/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Simulate typing by calling onChange and re-rendering with new value
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } });
    rerender(
      <QueryInput value="a" onChange={onChange} onSubmit={vi.fn()} isLoading={false} />
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('disables submit button when isLoading is true', () => {
    setup({ isLoading: true });
    expect(screen.getByRole('button', { name: /submit skin concern/i })).toBeDisabled();
  });

  it('does not call onSubmit when isLoading and button is clicked', () => {
    const onSubmit = vi.fn();
    setup({ value: 'oily skin', isLoading: true, onSubmit });
    fireEvent.click(screen.getByRole('button', { name: /submit skin concern/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits on Enter key press', () => {
    const onSubmit = vi.fn();
    setup({ value: 'acne', onSubmit });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', shiftKey: false });
    expect(onSubmit).toHaveBeenCalledWith('acne');
  });

  it('does not submit on Shift+Enter', () => {
    const onSubmit = vi.fn();
    setup({ value: 'acne', onSubmit });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('textarea has proper label association', () => {
    setup();
    expect(screen.getByLabelText(/describe your skin concern/i)).toBeInTheDocument();
  });
});
