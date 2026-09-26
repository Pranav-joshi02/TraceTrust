export type EpcisObjectEventInput = {
  eventCode: string;
  eventType: string;
  batchCode: string;
  productCode: string;
  eventTime: string;
  sourceOrganization: string;
  destinationOrganization?: string;
  evidenceHash?: string;
};

export function buildObjectEvent(input: EpcisObjectEventInput) {
  return {
    type: 'ObjectEvent',
    eventID: input.eventCode,
    eventTime: input.eventTime,
    bizStep: input.eventType.toLowerCase(),
    disposition: 'active',
    epcList: [`urn:epc:id:sgtin:${input.productCode}.${input.batchCode}`],
    sourceList: [{ type: 'owning_party', source: input.sourceOrganization }],
    destinationList: input.destinationOrganization ? [{ type: 'owning_party', destination: input.destinationOrganization }] : [],
    extension: {
      trusttrace: {
        evidenceHash: input.evidenceHash
      }
    }
  };
}
