.PHONY: run
run:
	npm run start

.PHONY: deploy
deploy:
	git add .
	git commit -m "$(message)"
	git push origin master
	npm run deploy