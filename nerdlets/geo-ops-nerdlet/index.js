import React, { PureComponent } from 'react';

import EmptyState from './EmptyState';
import CreateMap from './CreateMap';
import ViewMap from './ViewMap';
import MapList from './MapList';
import EditMap from './EditMap';

export default class index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      /*
       * Top-level "pages" - a poor man's navigation "router"
       */

      // We've queried for all Accounts and all Maps and found none
      emptyState: true,

      // Getting Started and Create new map
      createMap: false,

      // View Map
      viewMap: false,

      // Settings -> Map List
      mapList: false,

      // Settings -> Map List -> Edit Map/Edit Map Locations
      editMap: false,

      /*
       * Local State
       */

      accountId: 630060,

      // TO DO - Does Map selection live this high in the tree so we can pass it into Getting Started?
      selectedMap: null
    };
  }

  render() {
    const {
      emptyState,
      createMap,
      viewMap,
      mapList,
      editMap,
      accountId,
      selectedMap
    } = this.state;

    if (emptyState) {
      return (
        <EmptyState
          navigation={{
            next: () => this.setState({ emptyState: false, createMap: true }),
            back: () => {}
          }}
        />
      );
    }

    if (createMap) {
      return (
        <CreateMap
          accountId={accountId}
          map={selectedMap}
          onMapChange={({ map }) => {
            // eslint-disable-next-line no-alert
            alert("You've created a new map and stored it in Account Storage!");
            this.setState({ selectedMap: map });
          }}
          navigation={{
            next: () => this.setState({ createMap: false, mapList: true }),
            back: () => this.setState({ emptyState: false, createMap: true })
          }}
        />
      );
    }

    if (mapList) {
      return (
        <MapList
          navigation={{
            next: () => this.setState({ mapList: false, editMap: true }),
            back: () => this.setState({ emptyState: false, createMap: true }),
            create: () => this.setState({ mapList: false, createMap: true }),
            edit: ({ guid }) => {
              // const map = maps.find(m => m.document.guid === guid);

              this.setState({ mapList: false, editMap: true });
            },
            editWizard: ({ map }) => {
              this.setState({
                mapList: false,
                createMap: true,
                selectedMap: map
              });
            },
            viewMap: ({ map }) =>
              this.setState({ mapList: false, viewMap: true, selectedMap: map })
          }}
        />
      );
    }

    if (editMap) {
      return (
        <EditMap
          navigation={{
            next: () => this.setState({ editMap: false, viewMap: true }),
            back: () => this.setState({ editMap: false, mapList: true }),
            createMap: () => this.setState({ editMap: false, createMap: true })
          }}
        />
      );
    }

    if (viewMap) {
      return <ViewMap selectedMap={selectedMap} />;
    }
  }
}