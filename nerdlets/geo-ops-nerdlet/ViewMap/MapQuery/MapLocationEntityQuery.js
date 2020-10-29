import React from 'react';
import PropTypes from 'prop-types';
import { getEntitiesByGuidsQuery } from '../../../shared/services/queries';
import { mapWorkloadStatusValueToAlertSeverity } from '../../../shared/utils';
import { NerdGraphQuery } from 'nr1';

export default class MapLocationEntityQuery extends React.PureComponent {
  /**
   * STEP 1: Given a list of `entityGuids`, `getEntitiesByGuidsQuery` breaks down the list into 25-unit chunks of
   * searches and then recombine the results into one list of `entities`.
   * STEP 2: For each of the workloads, retrieve the `collection.status.value` to set `entity.alertSeverity` and `collection.entitySearchQuery` is added to the entity as a new attribute, `entitySearchQuery`.
   */
  static async query({
    entityGuids,
    begin_time,
    end_time,
    fetchPolicyType = NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE
  }) {
    const queries = [];
    while(entityGuids.length){
      let entity_guids = entityGuids.splice(0, 200);
      let query = getEntitiesByGuidsQuery({begin_time, end_time, entityGuids: entity_guids});
      queries.push({
        query, 
        variables: { begin_time, end_time, entityGuids: entity_guids }
      });
    }

    const queryResults = await Promise.all(queries.map(({query, variables}) => {
      return NerdGraphQuery.query({
        query,
        variables,
        fetchPolicyType
      })
    }))

    if (queryResults.find(({errors}) => errors)){
      return {errors, entities: null};
    }

    // console.debug('MapLocationEntityQuery.query', data);

    let entities = [];
    queryResults.forEach(({data}) => {
      if (data.actor){
        Object.keys(data.actor).forEach(query => {
          if (query.startsWith('query')){
            entities = [...entities, ...data.actor[query]];
          }
        })
      }
    });
    entities = entities.map(mapWorkloadStatusValueToAlertSeverity);
    return { entities, errors: null };
  }

  static propTypes = {
    map: PropTypes.object,
    entityGuids: PropTypes.array,
    begin_time: PropTypes.number,
    end_time: PropTypes.number,
    children: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      errors: null,
      entities: null
    };
  }

  async componentDidMount() {
    await this.load();
  }

  /**
   * If the map changed, reload the UI
   * else if the begin and end time has changed, reload the data but don't fully reset the UI
   * the difference is the outcome of how the load method is called
   */
  async componentDidUpdate(prevProps) {
    if (
      prevProps.map &&
      this.props.map &&
      prevProps.map.guid !== this.props.map.guid
    ) {
      this.load({ reset: true });
    } else if (
      (prevProps.begin_time &&
        this.props.begin_time &&
        prevProps.begin_time !== this.props.begin_time) ||
      (prevProps.end_time &&
        this.props.end_time &&
        prevProps.end_time !== this.props.end_time)
    ) {
      this.load({ reset: false });
    }
  }

  async load() {
    this.setState({ loading: true });

    const { entities, errors } = await MapLocationEntityQuery.query({
      entityGuids: this.props.entityGuids
    });

    this.setState({
      loading: false,
      entities,
      errors
    });
  }

  render() {
    const { entities, loading, errors } = this.state;
    const { children } = this.props;
    return children({
      loading,
      entities,
      errors
    });
  }
}
