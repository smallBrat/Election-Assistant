import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/render';
import { Home } from '../Home';
import { GuidedLearning } from '../GuidedLearning';
import { ElectionTimeline } from '../ElectionTimeline';
import { StepByStepGuide } from '../StepByStepGuide';
import { VoterRegistration } from '../VoterRegistration';
import { RequiredDocuments } from '../RequiredDocuments';
import { ElectionDayChecklist } from '../ElectionDayChecklist';
import { FAQ } from '../FAQ';
import { Glossary } from '../Glossary';

describe('core sections', () => {
  it('renders the Home hero and navigates to the guided learning path', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();

    renderWithProviders(<Home onNavigate={navigate} />);

    expect(screen.getByRole('heading', { name: /let’s understand the election process together/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /start the easy guide/i }));
    expect(navigate).toHaveBeenCalledWith('guided');
  });

  it('renders the major education sections without crashing', () => {
    renderWithProviders(<GuidedLearning />);
    expect(screen.getByRole('heading', { name: /the easy guide/i })).toBeInTheDocument();

    renderWithProviders(<ElectionTimeline />);
    expect(screen.getByRole('heading', { name: /how it unfolds/i })).toBeInTheDocument();

    renderWithProviders(<StepByStepGuide />);
    expect(screen.getByRole('heading', { name: /step-by-step guide/i })).toBeInTheDocument();

    renderWithProviders(<VoterRegistration />);
    expect(screen.getByRole('heading', { name: /registering to vote/i })).toBeInTheDocument();

    renderWithProviders(<RequiredDocuments />);
    expect(screen.getByRole('heading', { name: /what to bring/i })).toBeInTheDocument();
  });

  it('lets the user search and expand the FAQ', async () => {
    const user = userEvent.setup();

    renderWithProviders(<FAQ />);

    await user.type(screen.getByLabelText(/search frequently asked questions/i), 'registration');
    expect(screen.getByText(/what is voter registration/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /what is voter registration\?/i }));
    expect(screen.getByText(/signing up with your local election authority/i)).toBeInTheDocument();
  });

  it('shows an empty state when the FAQ data is missing', () => {
    renderWithProviders(<FAQ faqItems={[]} />);
    expect(screen.getByText(/we couldn't find any questions matching your search/i)).toBeInTheDocument();
  });

  it('shows an empty glossary state when no entries are available', () => {
    renderWithProviders(<Glossary glossaryItems={[]} />);
    expect(screen.getByText(/no definitions found/i)).toBeInTheDocument();
  });

  it('updates the election day checklist as items are checked', async () => {
    const user = userEvent.setup();

    renderWithProviders(<ElectionDayChecklist />);

    await user.click(screen.getByText(/look up where my polling station is/i));
    expect(screen.getByText(/14% Ready/i)).toBeInTheDocument();
  });

  it('expands a timeline phase', async () => {
    const user = userEvent.setup();

    renderWithProviders(<ElectionTimeline />);

    await user.click(screen.getByRole('button', { name: /voter registration period/i }));
    expect(screen.getByText(/citizens must register or update their details/i)).toBeInTheDocument();
  });
});
