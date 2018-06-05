/*
 * This is the Angular list controller for installations
 */

interface SWInst {
  software: string;
}

interface Software {
  swName: string;
  branch?: string;
  version?: string;
}

interface SWMeta {
  [key: string]: Software | undefined;
}

interface IInstListControllerScope extends ng.IScope {
  session: {
    user?: {};
  };
  props: IConfigProps;
  swMeta: SWMeta;
  usrBtnTxt?: string;
  usrBtnClk(): void;
}

appController.controller('InstListController', function(
  this: { dtOptions: {}, dtColumns: {} },
  DTOptionsBuilder: ng.datatables.DTOptionsBuilderService,
  DTColumnBuilder: ng.datatables.DTColumnBuilderService,
  $http: ng.IHttpService,
  $q: ng.IQService,
  $scope: IInstListControllerScope,
  $cookies: {},
  $window: ng.IWindowService,
  configService: IConfigService,
  userService: IUserService,
  swService: {},
) {
  $scope.$watch(() => {
    return $scope.session;
  },
  () => {
    // prep for login button
    if ($scope.session && $scope.session.user) {
      $scope.usrBtnTxt = '';
    } else {
      $scope.usrBtnTxt = 'Log in';
    }
  }, true);

  $scope.usrBtnClk = () => {
    if ($scope.session.user) {
      $window.location.href = $scope.props.webUrl + 'logout';
    } else {
      $window.location.href = $scope.props.webUrl + 'login';
    }
  };

  // get initialization info
  $scope.props = configService.getConfig();
  $scope.session = userService.getUser();
  const vm = this;
  // set the options. Note that installations promise fires
  // first then inner promise uses installation data to get
  // sw metadata. Only after inner promise sets the data is outer
  // promise resolved.
  vm.dtOptions = DTOptionsBuilder.fromFnPromise(() => {
    const defer = $q.defer();
    const url = basePath + '/api/v1/inst';
    // $http.get($scope.props.instApiUrl).then(function (result) {
    $http.get<SWInst[]>(url).then((result) => {
      const innerDefer = $q.defer();
      const swIds = result.data.map((r) => r.software);
      const swurl = basePath + '/api/v1/swdb/list';
      $http<SWMeta>({
        url: swurl,
        // url: $scope.props.apiUrl + "list",
        method: 'POST',
        data: JSON.stringify(swIds),
      }).then((innerResult) => {
        $scope.swMeta = innerResult.data;
        innerDefer.resolve(innerResult.data);
        defer.resolve(result.data);
      });
    });
    return defer.promise;
  })
    .withBootstrap()
    .withPaginationType('full_numbers')
    .withDOM('<"row"<"col-sm-8"l><"col-sm-4"B>>rtip');
  // vm.dtOptions.searching = true;

  // Build the column specs
  // Set the titles to include search input field
  // later attach to search actions
  vm.dtColumns = [
    DTColumnBuilder.newColumn('host')
      .withTitle('Host').withOption('defaultContent', '')
      .renderWith((data, type, full, meta) => {
        return '<a href="#/inst/details/' + full._id + '">' + full.host + '</a>';
      }),
    DTColumnBuilder.newColumn('name')
      .withTitle('Name').withOption('defaultContent', ''),
    DTColumnBuilder.newColumn('software')
      .withTitle('Software').withOption('defaultContent', '')
      .renderWith((data, type, full, meta) => {
        const sw = $scope.swMeta[full.software];
        if (!sw) {
          return '';
        }
        if (!sw.branch) {
          sw.branch = '';
        }
        if (!sw.version) {
          sw.version = '';
        }
        return '<a href="#/details/' + full.software + '" >' +
          sw.swName +
          ' / ' + sw.branch +
          ' / ' + sw.version +
          '</a>';
      }),
    DTColumnBuilder.newColumn('area')
      .withTitle('Area').withOption('defaultContent', ''),
    DTColumnBuilder.newColumn('drrs')
      .withTitle('DRR').withOption('defaultContent', ''),
    DTColumnBuilder.newColumn('status')
      .withTitle('Status')
      .renderWith((data, type, full, meta) => {
        return $scope.props.InstStatusEnum[data] || '';
      }),
    DTColumnBuilder.newColumn('statusDate')
      // .withTitle('Status Date').withOption('defaultContent', '')
      .withTitle('Status date (m/d/y)')
      .renderWith((data, type, full, meta) => {
        const thisDate = new Date(full.statusDate);
        const month = thisDate.getMonth() + 1;
        const day = thisDate.getDate();
        const year = thisDate.getFullYear();
        return month + '/' + day + '/' + year;
      }),
  ];

  angular.element('#instList').on('init.dt', (event, loadedDT) => {
    // wait for the init event from the datatable
    // (then it is done loading)
    // Handle multiple init notifications
    const id = '#' + $(event.target).attr('id');
    const num = $(id).find('thead').find('tr').length;
    if (num === 1) {
      const table = $(id).DataTable();
      const tr = $('<tr/>').appendTo($(id).find('thead'));

      // Apply the search
      table.columns().eq(0).each((colIdx) => {
        const th = $('<th></th>').appendTo(tr);
        const column = table.column(colIdx);
        // if (table.column(colIdx).searching) {
        // append column search with id derived from column init data
        th.append('<input id="' + column.dataSrc() + 'Srch'
          + '" type="text" placeholder="' + ((table.column(colIdx) as any).placeholder || '')
          // th.append('<input type="text" placeholder="' + (table.column(colIdx).placeholder || '')
          + '" style="width:80%;" autocomplete="off">');
        th.on('keyup', 'input', (evt) => {
          const elem = evt.target;
          if (elem instanceof HTMLInputElement) {
            table.column(colIdx).search(elem.value).draw();
          }
        });

        // Now apply filter routines to each column
        $('input', table.column(colIdx).header()).on('keyup change', (evt) => {
          console.log('searching column ' + colIdx);
          const v = $(evt.target).val();
          table
            .column(colIdx)
            .search(v ? String(v) : '')
            .draw();
        });
        // }
      });
    }
  });
});
