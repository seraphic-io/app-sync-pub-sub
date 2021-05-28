/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const me = /* GraphQL */ `
  query Me {
    me
  }
`;
export const getSunscribedQueue = /* GraphQL */ `
  query GetSunscribedQueue($id: ID!) {
    getSunscribedQueue(id: $id) {
      id
      username
      score
      hasSubscribed
      topic
      createdAt
      updatedAt
    }
  }
`;
export const listSunscribedQueues = /* GraphQL */ `
  query ListSunscribedQueues(
    $filter: ModelSunscribedQueueFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSunscribedQueues(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        username
        score
        hasSubscribed
        topic
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const searchSunscribedQueues = /* GraphQL */ `
  query SearchSunscribedQueues(
    $filter: SearchableSunscribedQueueFilterInput
    $sort: SearchableSunscribedQueueSortInput
    $limit: Int
    $nextToken: String
    $from: Int
  ) {
    searchSunscribedQueues(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
      from: $from
    ) {
      items {
        id
        username
        score
        hasSubscribed
        topic
        createdAt
        updatedAt
      }
      nextToken
      total
    }
  }
`;
