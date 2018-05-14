node_modules/@financial-times/n-gage/index.mk:
	npm install --no-save --no-package-lock @financial-times/n-gage
	touch $@

-include node_modules/@financial-times/n-gage/index.mk

.PHONY: test

unit-test:
	mocha --recursive

test-int:
	mocha int-tests/

test: verify test-unit
