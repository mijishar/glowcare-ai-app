import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SkinTypeTag from '../../components/SkinTypeTag';
import type { SkinType } from '../../types';

describe('SkinTypeTag', () => {
  it('renders nothing when skinType is null', () => {
    const { container } = render(<SkinTypeTag skinType={null} />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId('skin-type-tag')).toBeNull();
  });

  it.each<SkinType>(['Dry', 'Oily', 'Combination', 'Sensitive'])(
    'renders badge for skinType "%s"',
    (skinType) => {
      render(<SkinTypeTag skinType={skinType} />);
      const tag = screen.getByTestId('skin-type-tag');
      expect(tag).toBeInTheDocument();
      expect(tag).toHaveTextContent(`${skinType} Skin`);
    }
  );

  it('applies rose/pink Tailwind classes', () => {
    render(<SkinTypeTag skinType="Oily" />);
    const tag = screen.getByTestId('skin-type-tag');
    expect(tag.className).toMatch(/rose/);
  });
});
