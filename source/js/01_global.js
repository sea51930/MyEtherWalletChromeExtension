var PrivKey = "";
var decryptType = "";
var SavedNickNames = [];
var usdval;
var eurval;
$(document).ready(function() {
	bindElements();
	checkAndLoadPageHash();
});

function checkAndLoadPageHash() {
	if (window.location.hash) {
		var phash = window.location.hash.substr(1);
		$(".ptabs").each(function(index) {
			if ($(this).attr('id') == phash) {
				$(this).click();
				setTimeout(function() {
					$('html,body').scrollTop(0);
				}, 50);
				return;
			}
		});
	}
}

function paneNavigate(showEleId, activeEleId) {
	hideAllMainContainers();
	$("#" + showEleId).show();
	$("#" + activeEleId).parent().addClass('active');
	location.hash = activeEleId;
	onTabOpen(activeEleId);
	$('html,body').scrollTop(0);
}

function onTabOpen(tabid) {
	if (tabid == 'add-wallet') {
		setNickNames();
	} else if (tabid == 'wallets') {
		reloadMainPageWallets();
	} else if (tabid == 'send-transaction') {
		setSendTransactionWallets();
	}
}

function bindElements() {
	$(".ptabs").each(function(index) {
		$(this).click(function() {
			paneNavigate($(this).attr('showId'), this.id);
		});
	});
	$("#btndonate").click(function() {
		$("#sendtxaddress").val('0x7cb57b5a97eabe94205c07890be4c1ad31e486a8');
		$("#donateThanks").show();
		$("#sendtxaddress").trigger("keyup");
	});
	$("#btngeneratetranaction").click(function() {
		preCreateTransaction();
	});
	$("#btnapprovesend").click(function() {
		preSendTransaction();
	});
	$("#decryptAddWallet").click(function() {
		addDecryptedWallet();
	});
	$("#transferAllBalance").click(function() {
		getMaxSendAmount($("#accountAddress").html(), function(data) {
			$('#sendtxamount').val(data);
			$('input[type=radio][name=currencyRadio][value=ether]').prop("checked", true);
			$('#sendtxamount').trigger("keyup");
		}, function(err) {
			$("#txcreatestatus").html('<p class="text-center text-danger"><strong> ' + err + '</strong></p>').fadeIn(50).fadeOut(3000);
		});
	});
	$("#decryptdata").click(function() {
		$("#decryptStatus").html('<p class="text-center text-info"><strong> Please Wait...</strong></p>').fadeIn(10);
		setTimeout(function() {
			decryptFormData();
		}, 100);
	});
	$("#decryptSendTx").click(function() {
		$("#decryptStatusSendTx").html('<p class="text-center text-info"><strong> Please Wait...</strong></p>').fadeIn(10);
		setTimeout(function() {
			decryptSendTxData();
		}, 100);
	});
	$("#generateNewWallet").click(function() {
		generateSingleWallet();
	});
	$('input[type=radio][name=typeOfKeyRadio]').change(function() {
		PrivKey = "";
		$('#fuploadStatus').empty();
		$('#walletfilepassword').val('');
		$('#privkeypassword').val('');
		$('.btn-file :file').val('');
		$('#manualprivkey').val('')
		$("#walletuploadbutton").hide();
		$("#walletPasdiv").hide();
		$("#divprikeypassword").hide();
		$("#addDecryptedWalletDiv").hide();
		$("#decryptStatus").hide();
		$("#selectedTypeKey").hide();
		$("#selectedUploadKey").hide();
		$("#selectedGenNewWallet").hide();
		$("#newWalletGenButtonDiv").hide();
		if (this.value == 'fileupload') {
			$("#selectedUploadKey").show();
			decryptType = "fupload";
		} else if (this.value == 'pasteprivkey') {
			$("#selectedTypeKey").show();
			decryptType = "privkey";
		} else if (this.value == 'gennewwallet') {
			$("#selectedGenNewWallet").show();
			$("#newWalletGenButtonDiv").show();
			decryptType = "newwallet";
		}
	});
	$('input[type=radio][name=currencyRadio]').change(function() {
		$("#sendtxamount").trigger("keyup");
	});
	$('#walletfilepassword').on('paste, keyup', function() {
		if ($('#walletfilepassword').val() != "") {
			$("#uploadbtntxt-wallet").show();
			$("#uploadbtntxt-privkey").hide();
			$("#walletuploadbutton").show();
		} else {
			$("#walletuploadbutton").hide();
		}
	});
	$('#sendtxamount').on('paste, keyup', function() {
		var amount = $('#sendtxamount').val();
		if ($('#sendtxamount').val() != "" && $.isNumeric(amount) && amount > 0) {
			var etherUnit = $('input[type=radio][name=currencyRadio]:checked').val();
			$("#weiamount").html('<p class="text-success"><strong>' + toWei(amount, etherUnit) + ' wei ( approximately ' + toFiat(amount, etherUnit, usdval) + ' USD/' + toFiat(amount, etherUnit, eurval) + ' EUR )</strong></p>');
		} else if ($('#sendtxamount').val() != "" && !$.isNumeric(amount)) {
			$("#weiamount").html('<p class="text-danger"><strong>Invalid amount</strong></p>');
		} else {
			$("#weiamount").html('');
		}
	});
	$('#sendtxaddress').on('paste, keyup', function() {
		if (validateEtherAddress($('#sendtxaddress').val())) {
			$("#addressvalidate").html('<p class="text-success"><strong> Address is valid</strong></p>').fadeIn(50);
		} else if ($('#sendtxaddress').val() == "") {
			$("#addressvalidate").html('');
		} else {
			$("#addressvalidate").html('<p class="text-danger"><strong> Invalid address</strong></p>').fadeIn(50);
		}
	});
	$('#privkeypassword').on('paste, keyup', function() {
		if ($('#privkeypassword').val().length > 6) {
			$("#uploadbtntxt-wallet").hide();
			$("#uploadbtntxt-privkey").show();
			$("#walletuploadbutton").show();
		} else {
			$("#walletuploadbutton").hide();
		}
	});
	$('#manualprivkey').on('paste, keyup', function() {
		$("#divprikeypassword").hide();
		$("#walletuploadbutton").hide();
		$("#uploadbtntxt-wallet").hide();
		$("#uploadbtntxt-privkey").hide();
		$("#manualprivkey").val($("#manualprivkey").val().replace(/(?:\r\n|\r|\n| )/g, ''));
		if ($('#manualprivkey').val().length == 128 || $('#manualprivkey').val().length == 132) {
			$("#divprikeypassword").show();
		} else if ($('#manualprivkey').val().length == 64) {
			$("#uploadbtntxt-wallet").hide();
			$("#uploadbtntxt-privkey").show();
			$("#walletuploadbutton").show();
		}
	});
	$('.btn-file :file').change(function() {
		if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
			alert('The File APIs are not fully supported in this browser. Please use a modern browser');
			return;
		}
		var input = $(this),
			numFiles = input.get(0).files ? input.get(0).files.length : 1,
			label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
		input.trigger('fileselect', [numFiles, label]);
	});
	$('.btn-file :file').on('fileselect', function(event, numFiles, label) {
		$('#fuploadStatus').empty();
		$('#walletfilepassword').val('');
		PrivKey = "";
		file = $('.btn-file :file')[0].files[0];
		var fr = new FileReader();
		fr.onload = function() {
			try {
				if (walletRequirePass(fr.result)) {
					$("#walletPasdiv").show();
					$("#walletuploadbutton").hide();
				} else {
					$("#walletPasdiv").hide();
					$("#walletuploadbutton").show();
					$("#uploadbtntxt-wallet").show();
					$("#uploadbtntxt-privkey").hide();
				}
			} catch (err) {
				$('#fuploadStatus').append('<p class="text-center text-danger"><strong> ' + err + '</strong></p>');
			}
		};
		fr.readAsText(file);
		var input = $(this).parents('.input-group').find(':text'),
			log = numFiles > 1 ? numFiles + ' files selected' : label;
		if (input.length) {
			input.val(log);
		} else {
			if (log) {
				$('#fuploadStatus').append('<p class="text-center text-success"><strong> File Selected: ' + log + '</strong></p>');
			}
		}
	});
}

function setNickNames() {
	getAllNickNames(function(data) {
		SavedNickNames = data;
	});
}

function preSendTransaction() {
	sendTransaction($("#tasignedtx").val(), function(data) {
		$("#txsendstatus").html('<p class="text-center text-success"><strong> Transaction submitted. TX ID: ' + data + '</strong></p>');
		setWalletBalance(1);
	}, function(err) {
		$("#txsendstatus").html('<p class="text-center text-danger"><strong>' + err + '</strong></p>');
	});
	$('#sendTransaction').modal('hide');
}

function preCreateTransaction() {
	try {
		$("#tarawtx").val("");
		$("#tasignedtx").val("");
		$("#txsendstatus").html('')
		var toAddress = $('#sendtxaddress').val();
		if (PrivKey.length != 64) throw "Invalid Private key, try again";
		if (!validateEtherAddress(toAddress)) throw "Invalid to Address, try again";
		if (!$.isNumeric($('#sendtxamount').val()) || $('#sendtxamount').val() <= 0) throw "Invalid amount, try again";
		var etherUnit = $('input[type=radio][name=currencyRadio]:checked').val();
		var weiAmount = toWei($('#sendtxamount').val(), etherUnit);
		createTransaction(PrivKey, toAddress, weiAmount, function(data) {
			$("#tarawtx").val(data.raw);
			$("#tasignedtx").val(data.signed);
			$("#txcreatestatus").html('<p class="text-center text-success"><strong> Transaction generated</strong></p>').fadeIn(50);
			$("#divtransactionTAs").show();
			$("#divsendtranaction").show();
			$("#confirmAmount").html($('#sendtxamount').val());
			$("#confirmCurrancy").html(etherUnit);
			$("#confirmAddress").html(toAddress);
		}, function(err) {
			$("#txcreatestatus").html('<p class="text-center text-danger"><strong> ' + err + '</strong></p>').fadeIn(50).fadeOut(3000);
			$("#divtransactionTAs").hide();
			$("#divsendtranaction").hide();
		});
	} catch (err) {
		$("#txcreatestatus").html('<p class="text-center text-danger"><strong> ' + err + '</strong></p>').fadeIn(50).fadeOut(3000);
		$("#divtransactionTAs").hide();
		$("#divsendtranaction").hide();
	}
}

function getErrorText(err) {
	return '<p class="text-center text-danger"><strong> ' + err + '</strong></p>';
}

function getSuccessText(text) {
	return '<p class="text-center text-success"><strong> ' + text + '</strong></p>';
}

function setSendTransactionWallets() {
	getWalletsArr(function(wallets) {
		$("#tblsendtransactionWallets > tbody").empty();
		for (var i = 0; i < wallets.length; i++) {
			var cobj = wallets[i];
			var tblRow = '<tr><td><label><input type="radio" name="selectedWallet" value="' + cobj.addr + '">' + cobj.nick + '</label></td><td id="walBalance-' + i + '">loading</td></tr>';
			$("#tblsendtransactionWallets > tbody").append(tblRow);
			updateTableRowBalance(cobj.addr, 'walBalance-' + i);
		}
	});
}

function reloadMainPageWallets() {
	getWalletsArr(function(wallets) {
		$("#tblwalletsmain > tbody").empty();
		for (var i = 0; i < wallets.length; i++) {
			var cobj = wallets[i];
			var tblRow = '<tr><td>' + cobj.nick + '</td><td>' + cobj.addr + '</td><td id="walBalance-' + i + '">loading</td><td> <a href="#"> Edit </a></td><td> <a href="#SHOW_REMOVE_POP_UP"> Remove </a></td></tr>';
			$("#tblwalletsmain > tbody").append(tblRow);
			updateTableRowBalance(cobj.addr, 'walBalance-' + i);
		}
	});
}

function updateTableRowBalance(address, rawid) {
	getBalance(address, function(result) {
		if (!result.error) {
			var bestCurAmount = getBestEtherKnownUnit(result.data.balance);
			$("#" + rawid).html(bestCurAmount.amount + " " + bestCurAmount.unit);
		}
	});
}

function setWalletBalance(id) {
	getBalance($("#accountAddress" + id).html(), function(result) {
		if (!result.error) {
			var bestCurAmount = getBestEtherKnownUnit(result.data.balance);
			$("#accountBalance" + id).html(bestCurAmount.amount + " " + bestCurAmount.unit);
			getETHvalue('USD', function(value) {
				usdval = toFiat(bestCurAmount.amount, bestCurAmount.unit, value);
				$("#accountBalanceUsd" + id).html(usdval + " USD");
			});
			getETHvalue('EUR', function(value) {
				eurval = toFiat(bestCurAmount.amount, bestCurAmount.unit, value);
				$("#accountBalanceEur" + id).html(eurval + " EUR");
			});
		} else
		alert(result.msg);
	});
}

function walletDecryptSuccess(id) {
	$("#accountAddress" + id).html(formatAddress(strPrivateKeyToAddress(PrivKey), 'hex'));
	setWalletBalance(id);
	$("#decryptStatus" + id).html('<p class="text-center text-success"><strong> Wallet successfully decrypted</strong></p>').fadeIn(2000);
	$("#walletpreview" + id).show();
}

function walletDecryptFailed(id, err) {
	$("#decryptStatus" + id).html('<p class="text-center text-danger"><strong> ' + err + '</strong></p>').fadeIn(50).fadeOut(3000);
	$("#walletpreview" + id).hide();
}

function addDecryptedWallet() {
	var password = $("#decryptwalletpin").val();
	var nickname = stripScriptTags($("#decryptwalletnickname").val());
	if (password == "") {
		$("#AddDecryptedWalletStatus").html(getErrorText("You must enter a PIN")).fadeIn(50).fadeOut(3000);
	} else if (password.length < 8) {
		$("#AddDecryptedWalletStatus").html(getErrorText("Your password must be at least 8 characters")).fadeIn(50).fadeOut(3000);
	} else if (nickname == "") {
		$("#AddDecryptedWalletStatus").html(getErrorText("You must enter a nickname for your wallet")).fadeIn(50).fadeOut(3000);
	} else if ($.inArray(nickname, SavedNickNames) > -1) {
		$("#AddDecryptedWalletStatus").html(getErrorText("Nickname is in use, please select different nickname")).fadeIn(50).fadeOut(3000);
	} else if (PrivKey == "" || PrivKey.length != 64) {
		$("#AddDecryptedWalletStatus").html(getErrorText("Invalid Private key try to decrypt the wallet again")).fadeIn(50).fadeOut(3000);
	} else {
		var address = formatAddress(strPrivateKeyToAddress(PrivKey), 'hex');
		var encprivkey = encryptPrivKey(PrivKey, password);
		addWalletToStorage(address, encprivkey, nickname, function() {
			if (chrome.runtime.lastError) {
				$("#AddDecryptedWalletStatus").html(getErrorText(chrome.runtime.lastError.message)).fadeIn(50).fadeOut(3000);
			} else {
				$("#AddDecryptedWalletStatus").html(getSuccessText("New Wallet Generated! " + nickname + ":" + address)).fadeIn(50).fadeOut(5000);
				setNickNames();
			}
		});
	}
}

function decryptFormData() {
	PrivKey = "";
	if (decryptType == 'fupload') {
		file = $('.btn-file :file')[0].files[0];
		var fr = new FileReader();
		fr.onload = function() {
			try {
				PrivKey = getWalletFilePrivKey(fr.result, $('#walletfilepassword').val());
				walletDecryptSuccess(0);
			} catch (err) {
				walletDecryptFailed(0, err);
			}
		};
		fr.readAsText(file);
	} else if (decryptType == 'privkey') {
		try {
			PrivKey = decryptTxtPrivKey($('#manualprivkey').val(), $("#privkeypassword").val());
			walletDecryptSuccess(0);
		} catch (err) {
			walletDecryptFailed(0, "Invalid password");
		}
	}
}

function decryptSendTxData() {
	var addr = $('input[type=radio][name=selectedWallet]:checked').val();
	var pin = $('#sendTransactionPin').val();
	if (addr == "") {
		$("#decryptStatus1").html(getErrorText("Please select a wallet")).fadeIn(50).fadeOut(3000);
	} else if (pin == "") {
		$("#decryptStatus1").html(getErrorText("Please enter the pin of the wallet")).fadeIn(50).fadeOut(3000);
	} else {
		getWalletFromStorage(addr, function(data) {
			try {
				if (!chrome.runtime.lastError) {
					PrivKey = decryptTxtPrivKey(JSON.parse(data[addr]).priv, pin);
					walletDecryptSuccess(1);
				} else {
					throw chrome.runtime.lastError.message;
				}
			} catch (err) {
				walletDecryptFailed(1, "Invalid password " + err);
			}
		});
	}
}

function hideAllMainContainers() {
	$("#paneWallets").hide();
	$("#paneAddWallet").hide();
	$("#paneWalgen").hide();
	$("#paneBulkgen").hide();
	$("#paneSendTrans").hide();
	$("#panePopContracts").hide();
	$("#paneHelp").hide();
	$("#paneContact").hide();
	$("#panePrint").hide();
	$("#wallets").parent().removeClass('active');
	$("#add-wallet").parent().removeClass('active');
	$("#bulk-generate").parent().removeClass('active');
	$("#generate-wallet").parent().removeClass('active');
	$("#send-transaction").parent().removeClass('active');
	$("#popular-contracts").parent().removeClass('active');
	$("#help").parent().removeClass('active');
	$("#contact").parent().removeClass('active');
}

function generateSingleWallet() {
	var password = $("#ethgenpassword").val();
	var nickname = stripScriptTags($("#newWalletNick").val());
	if (password == "") {
		$("#generatedWallet").html(getErrorText("You must enter a PIN")).fadeIn(50).fadeOut(3000);
	} else if (password.length < 8) {
		$("#generatedWallet").html(getErrorText("Your password must be at least 8 characters")).fadeIn(50).fadeOut(3000);
	} else if (nickname == "") {
		$("#generatedWallet").html(getErrorText("You must enter a nickname for your wallet")).fadeIn(50).fadeOut(3000);
	} else if ($.inArray(nickname, SavedNickNames) > -1) {
		$("#generatedWallet").html(getErrorText("Nickname is in use, please select different nickname")).fadeIn(50).fadeOut(3000);
	} else {
		var acc = new Accounts();
		var newAccount = acc.new();
		var address = newAccount.address;
		var encprivkey = encryptPrivKey(newAccount.private, password);
		addWalletToStorage(address, encprivkey, nickname, function() {
			if (chrome.runtime.lastError) {
				$("#generatedWallet").html(getErrorText(chrome.runtime.lastError.message)).fadeIn(50).fadeOut(3000);
			} else {
				$("#generatedWallet").html(getSuccessText("New Wallet Generated! " + nickname + ":" + address)).fadeIn(50).fadeOut(5000);
				setNickNames();
				$("#ethgenpassword").val('');
				$("#newWalletNick").val('');
			}
		});
		acc.clear();
	}
}

function stripScriptTags(str) {
	var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
	while (SCRIPT_REGEX.test(str)) {
		str = str.replace(SCRIPT_REGEX, "");
	}
	return str;
}

function openPrintPaperWallets(strjson) {
	var win = window.open("about:blank", "_blank");
	$.get('printwallets.html', function(data) {
		data = data.replace("{{WALLETJSON}}", strjson);
		win.document.write(data);
		$(win).ready(function() {
			win.document.write("<script>generateWallets();</script>");
		});
	});
}

function printQRcode() {
	var address = $("#address").val();
	var privkey = $("#privkey").val();
	var jsonarr = [];
	jsonarr.push({
		address: address,
		private: privkey
	});
	openPrintPaperWallets(JSON.stringify(jsonarr));
}