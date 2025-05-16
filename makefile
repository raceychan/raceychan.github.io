.PHONY: run
run:
	npx docusaurus start --port 8888

.PHONY: deploy
deploy:
	git add .
	git commit -m "$(message)"
	git push origin master
	npm run deploy