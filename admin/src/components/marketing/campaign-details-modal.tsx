import { useModalState, useModalAction } from '@/components/ui/modal/modal.context';
import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700',
  sending: 'bg-blue-100 text-blue-700',
  sent: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const CampaignDetailsModal = () => {
  const { data } = useModalState();
  const { closeModal } = useModalAction();
  const { t } = useTranslation();

  if (!data) return null;

  const isEmail = typeof data.heading !== 'undefined';

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-2xl">
      {/* Header */}
      <div className="bg-gray-50 border-b border-border-base px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-heading mb-1">
            {t('common:text-campaign-details', 'Campaign Details')}
          </h2>
          <div className="flex items-center space-x-2 text-sm text-body">
            <span className="font-medium text-gray-500 uppercase tracking-wider text-xs">
              {isEmail ? t('common:text-email', 'Email') : t('common:text-sms', 'SMS')}
            </span>
            <span className="text-gray-300">•</span>
            <span>{dayjs(data.created_at).format('DD MMM YYYY, hh:mm A')}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              STATUS_COLORS[data.status] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {data.status}
          </span>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 hover:bg-gray-200 p-1.5 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto w-full">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded border border-gray-100">
            <span className="block text-xs text-gray-400 uppercase tracking-wider mb-1">
              {t('common:audience-count', 'Audience Count')}
            </span>
            <span className="text-lg font-bold text-heading">
              {(data.recipient_count ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="bg-gray-50 p-4 rounded border border-gray-100">
            <span className="block text-xs text-gray-400 uppercase tracking-wider mb-1">
              {t('common:sent-at', 'Sent At')}
            </span>
            <span className="text-lg font-bold text-heading">
              {data.sent_at ? dayjs(data.sent_at).format('DD MMM YYYY, hh:mm A') : '—'}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            {isEmail ? t('form:input-label-subject', 'Subject') : t('form:input-label-sms-subject', 'SMS Subject')}
          </h3>
          <p className="text-heading text-base font-medium">{data.subject || '—'}</p>
        </div>

        {isEmail && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              {t('form:input-label-heading', 'Heading')}
            </h3>
            <p className="text-heading text-base">{data.heading || '—'}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {t('form:input-label-body', 'Message Body')}
          </h3>
          <div
            className="prose prose-sm max-w-none bg-gray-50/50 p-4 rounded-md border border-gray-100 min-h-[150px]"
            dangerouslySetInnerHTML={{ __html: data.body || '—' }}
          />
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailsModal;
