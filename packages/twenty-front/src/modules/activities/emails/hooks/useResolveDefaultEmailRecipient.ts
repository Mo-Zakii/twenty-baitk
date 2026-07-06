import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { CoreObjectNameSingular } from 'twenty-shared/types';

type UseResolveDefaultEmailRecipientParams = {
  objectNameSingular: string | null | undefined;
  recordId: string | null | undefined;
};

export const useResolveDefaultEmailRecipient = ({
  objectNameSingular,
  recordId,
}: UseResolveDefaultEmailRecipientParams) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const fallbackObjectNameSingular =
    objectMetadataItems[0]?.nameSingular ??
    CoreObjectNameSingular.WorkspaceMember;

  const hasPersonObject = objectMetadataItems.some(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === CoreObjectNameSingular.Person,
  );
  const hasCompanyObject = objectMetadataItems.some(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === CoreObjectNameSingular.Company,
  );
  const hasOpportunityObject = objectMetadataItems.some(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === CoreObjectNameSingular.Opportunity,
  );

  const isPerson = objectNameSingular === CoreObjectNameSingular.Person;
  const isCompany = objectNameSingular === CoreObjectNameSingular.Company;
  const isOpportunity =
    objectNameSingular === CoreObjectNameSingular.Opportunity;

  const skipPerson = !isPerson || !recordId || !hasPersonObject;
  const skipCompanyPeople =
    !isCompany || !recordId || !hasPersonObject || !hasCompanyObject;
  const skipOpportunity =
    !isOpportunity || !recordId || !hasOpportunityObject;

  const { record: personRecord, loading: personLoading } = useFindOneRecord({
    objectNameSingular: hasPersonObject
      ? CoreObjectNameSingular.Person
      : fallbackObjectNameSingular,
    objectRecordId: recordId ?? '',
    recordGqlFields: { id: true, emails: { primaryEmail: true } },
    skip: skipPerson,
  });

  const { records: companyPeople, loading: companyPeopleLoading } =
    useFindManyRecords({
      objectNameSingular: hasPersonObject
        ? CoreObjectNameSingular.Person
        : fallbackObjectNameSingular,
      filter: { companyId: { eq: recordId ?? '' } },
      recordGqlFields: { id: true, emails: { primaryEmail: true } },
      limit: 1,
      skip: skipCompanyPeople,
    });

  const { record: opportunityRecord, loading: opportunityLoading } =
    useFindOneRecord({
      objectNameSingular: hasOpportunityObject
        ? CoreObjectNameSingular.Opportunity
        : fallbackObjectNameSingular,
      objectRecordId: recordId ?? '',
      recordGqlFields: {
        id: true,
        pointOfContact: { id: true, emails: { primaryEmail: true } },
      },
      skip: skipOpportunity,
    });

  const defaultTo = isPerson
    ? (personRecord?.emails?.primaryEmail ?? '')
    : isCompany
      ? (companyPeople[0]?.emails?.primaryEmail ?? '')
      : isOpportunity
        ? (opportunityRecord?.pointOfContact?.emails?.primaryEmail ?? '')
        : '';

  const loading =
    (isPerson && personLoading) ||
    (isCompany && companyPeopleLoading) ||
    (isOpportunity && opportunityLoading);

  return { defaultTo, loading };
};
