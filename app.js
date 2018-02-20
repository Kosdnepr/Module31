$(function() {

	// main div
	var $main = $('#main');
	// new user form
	var $newUserDiv = $('#newUserDiv');
	// users table
	var $tableHeader = $('#tableHeader');	
	var $usersTableDiv = $('#usersTableDiv');
	var $container = $('#container');
	// add new user form
	var $createClientBtn = $('#createClientBtn');
	var $addNewClientBtn = $('#addNewClientBtn');
	var $cancelBtn = $('#cancelBtn');
	var $id = $('#id');
	var $moneySpent = $('#moneySpent');
	var $ordersCount = $('#ordersCount');
	var $name = $('#name');
	var $surname = $('#surname');
	var $manager = $('#manager');
	// tempaltes
	var userTemplate = $('#userTemplate').html();
	// dialog
	var $dialogForm = $('#dialogForm');
	var $orderAmount = $('#orderAmount');
	var $warning = $('#warning');
	var dialog;
	// default values of var
	var serverURL = 'http://5a85a7b1085fdd00127042ad.mockapi.io/customers';
	var warning = '<p>You entered not a number<p>';
	var sortby;
	var direction;
	var directionCounter = 1;

	init();

	// create client
	$createClientBtn.on('click', onCreateClientBtnClick);
	$addNewClientBtn.on('click', onAddNewClientBtnClick);
	$cancelBtn.on('click', onCancelBtnClick);
	// edite client
	$container.on('click', '.editClientBtn', onEditClientBtnClick);
	$container.on('click', '.delClientBtn', onDelClientBtnClick);
	$container.on('click', '.addOrderBtn', onAddOrderBtnClick);
	// sort
	$tableHeader.on('click', '[name = sortHeader]', onHeaderClick);


	// callbacks
	function onCreateClientBtnClick(event) {
		toggleInputForm();
	}

	function onAddNewClientBtnClick(event) {
		var client = {
			id: $id.val(),
			moneySpent: +$moneySpent.val(),
			ordersCount: +$ordersCount.val(),
			name: $name.val(),
			surname: $surname.val(),
			manager: $manager.val()
		}
		setClient(client);
		toggleInputForm();
	}

	function onCancelBtnClick(event) {
		event.preventDefault();
		clearForm();
		onCreateClientBtnClick();
	}

	function onEditClientBtnClick(event) {
		event.preventDefault();
		var id = $(this).closest('tr').data('id');
		onCreateClientBtnClick();
		getClientData(id);
	}

	function onDelClientBtnClick(event) {
		event.preventDefault();
		var id = $(this).closest('tr').data('id');
		deleteClient(id);
		sortWithHeaderParams(sortby);
	}

	function onAddOrderBtnClick(event) {
		event.preventDefault();
		var id = $(this).closest('tr').data('id');
		getClientData(id);
		dialog.dialog('open');
	}

	function onHeaderClick(event) {
		sortby = $(this).closest('th').data('sortby');
		sortWithHeaderParams(sortby);
		changeSortingDirection();
	}


	// business logic
	function init() {
		getList();
	}

	function getList() {
		clearTableData();
		return request('GET', '/', {})
		.then(function(data) {
			showClientsList(data);
		});
	}

	function showClientsList(data) {
		var client;
			for(var prop in data) {
				client = data[prop];
				showUser(client);
			}
	}

	function showUser(client) {
		var $row = renderUser(client);
		$container.append($row);
	}

	function renderUser(client) {
		var row = userTemplate
			.replace('{{id}}', client.id)
			.replace('{{name}}', client.name)
			.replace('{{surname}}', client.surname)
			.replace('{{manager}}', client.manager)
			.replace('{{ordersCount}}', +client.ordersCount)
			.replace('{{moneySpent}}', +client.moneySpent);

		return $(row);
	}

	function toggleInputForm() {
		$main.toggleClass('form');
	}

	function setClient(client) {
		client.id ? updateClient(client) : addClient(client);
	}

	function addClient(client) {
		addNewClient(client);
		clearForm();
	}

	function addNewClient(client) {
		return request('POST', '/', client)
			.then(function(data) {
				sortWithHeaderParams(sortby);
			})
	}

	function updateClient(client) {
		editClientData(client);
		clearForm();
	}

	function editClientData(client) {
		return request('PUT', '/' + client.id, client)
			.then(function(data){
				sortWithHeaderParams(sortby);
			});
	}

	function sortWithHeaderParams(sortby) {
		return request('GET', '?sortBy=' + sortby + '&order=' + direction, {})
			.then(function(data){
				clearTableData();
				showClientsList(data);
			});
	}

	function changeSortingDirection() {
		if (directionCounter % 2 == 0) {
			direction = 'asc';
		} else {
			direction = 'desc';
		}
		directionCounter++;
	}

	function getClientData(id) {
		return request('GET', '/' + id, {})
			.then(function(client) {
				renderEditClientForm(client);
			});
	}

	function renderEditClientForm(client) {
		fillClientForm(client);
	}

	function fillClientForm(client) {
		$id.val(client.id);
		$moneySpent.val(client.moneySpent);
		$ordersCount.val(client.ordersCount);
		$name.val(client.name);
		$surname.val(client.surname);
		$manager.val(client.manager);
	}

	function onAddNewClientBtnClick(event) {
		var client = {
			id: $id.val(),
			moneySpent: +$moneySpent.val(),
			ordersCount: +$ordersCount.val(),
			name: $name.val(),
			surname: $surname.val(),
			manager: $manager.val()
		}
		setClient(client);
		toggleInputForm();
	}

	function deleteClient(id) {
		return request('DELETE', '/' + id, {})
			.then(function(data) {
				sortWithHeaderParams(sortby);
			});
	}

	dialog = $dialogForm.dialog({
	    autoOpen: false,
	    height: 400,
	    width: 350,
	    modal: true,
	    buttons: {
	    	'Add': onAddAmountBtnClick,
	    	'Cancel': onCancelModalBtnClick
	    }
    });

	function onAddAmountBtnClick() {
		if(checkInputedAmount()) {
			updateClientAmount()
		} else {
			$warning.html(warning);
		}
	}

	function updateClientAmount() {
		addClientAmount();
		incrementOrders();
		onAddNewClientBtnClick();
		toggleInputForm();
		onCancelModalBtnClick();
	}

	function addClientAmount() {
		$moneySpent.val(+$moneySpent.val() + +$orderAmount.val());
	}

	function incrementOrders() {
		$ordersCount.val(+$ordersCount.val() + 1);
	}

	function onCancelModalBtnClick() {
		dialog.dialog('close');
		clearModalForm();
	}

	function checkInputedAmount() {
		var result = true;
		result = !!$orderAmount.val();
		return result;
	}

	function request(method, uri, data) {
		return $.ajax(serverURL + uri, {
			method: method,
			data: data
		});
	}

	function clearForm() {
		$id.val('');
		$moneySpent.val('');
		$ordersCount.val('');
		$name.val('');
		$surname.val('');
		$manager.val('');
	}

	function clearTableData() {
		$container.html('');
	}

	function clearModalForm() {
		$orderAmount.val('');
		$warning.html('');
	}
});

