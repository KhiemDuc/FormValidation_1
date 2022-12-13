function Validator(options) {
    var formElement = document.querySelector(options.form)
    var selecterRules = {}

    //Tìm cha nó
    function getParent(element, selecter) {
        if (element.parentElement.matches(selecter)) {
            return element.parentElement
        } else {
            return getParent(element.parentElement, selecter)
        }
    }

    if (formElement) {

        //formsubmit
        formElement.onsubmit = function(e) {
            e.preventDefault()
            var isFormValid = true
            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selecter)
                var isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false
                }
            })

            if (isFormValid) {
                //Trường hợp submit với js
                if (typeof options.onSubmit === 'function') {
                    var enableInput = formElement.querySelectorAll('[name]')
                    console.log(enableInput);
                    var formValue = Array.from(enableInput).reduce(function(values, input) {
                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break;
                            case 'checkbox':
                                if (input.matches(':checked')) {
                                    if (!Array.isArray(values[input.name])) {
                                        values[input.name] = []
                                    }
                                    values[input.name].push(input.value)
                                }
                                break
                            default:
                                values[input.name] = input.value
                                break;
                        }
                        return values
                    }, {})

                    options.onSubmit(formValue)
                }
                //Trường hợp submit mặc định  
                else {

                }
            }
        }

        // validate
        function validate(inputElement, rule) {
            var errorMess;
            var elementMessError = getParent(inputElement, options.formGroup_Selector).querySelector(options.errorSelector)
            for (var selecterRule of selecterRules[rule.selecter]) {

                switch (inputElement.type) {
                    case 'checkbox':
                    case 'radio':
                        errorMess = selecterRule(
                            formElement.querySelector(rule.selecter + ':checked')
                        )
                        break
                    default:
                        errorMess = selecterRule(inputElement.value)
                }
                if (errorMess) {
                    break;
                }
            }

            if (errorMess) {
                elementMessError.innerText = errorMess
                getParent(inputElement, options.formGroup_Selector).classList.add('invalid')
            } else {
                elementMessError.innerText = ''
                getParent(inputElement, options.formGroup_Selector).classList.remove('invalid')
            }
            return !errorMess
        }
        // lắng nghe các sự kiện
        options.rules.forEach(rule => {
            var inputElements = formElement.querySelectorAll(rule.selecter)
            console.log(inputElements);
            if (Array.isArray(selecterRules[rule.selecter])) {
                selecterRules[rule.selecter].push(rule.test)
            } else {
                selecterRules[rule.selecter] = [rule.test]
            }
            Array.from(inputElements).forEach(function(inputElement) {
                if (inputElement) {
                    //Xử lý sự kiện khi blur
                    inputElement.onblur = function() {
                        validate(inputElement, rule)
                    }

                    //Xử lý sự kiện khi nhập vào
                    inputElement.oninput = function() {
                        validate(inputElement, rule)
                    }
                }
            })
        });


    }
}

Validator.isRequired = function(selecter, mess = 'Vui lòng không để trống trường này') {
    return {

        selecter: selecter,
        test: function(value) {
            return value ? undefined : mess
        }
    }
}

Validator.isEmail = function(selecter, mess = 'Đây không phải email') {
    return {

        selecter: selecter,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : mess
        }
    }
}

Validator.minLength = function(selecter, mlength, mess = `Vui lòng nhập tối thiếu ${mlength} ký tự`) {
    return {

        selecter: selecter,
        test: function(value) {
            return (value.length >= mlength) ? undefined : mess
        }
    }
}

Validator.isConfirm = function(selecter, value2, mess = 'Mật khẩu bạn điền chưa chính xác') {
    return {

        selecter: selecter,
        test: function(value1) {
            return value1 == value2() ? undefined : mess
        }
    }
}