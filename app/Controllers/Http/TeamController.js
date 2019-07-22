'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Role = use('Adonis/Acl/Role')

/**
 * Resourceful controller for interacting with teams
 */
class TeamController {
  /**
   * Show a list of all teams.
   * GET teams
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ auth, request, response, view }) {
    // busca o usuario logado e pega todos os times que ele faz parte
    const teams = await auth.user.teams().fetch()

    return teams
  }

  /**
   * Create/save a new team.
   * POST teams
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ auth, request, response }) {
    const data = request.only(['name'])

    // ao utilizar a criacao de um registro atraves dos relacionamentos
    // o relacionamento do pai com filho ja eh automaticamente feito
    // passamos o user_id pq temos que gravar quem eh o dono do time (info adicional)
    const team = await auth.user.teams().create({
      ...data,
      user_id: auth.user.id
    })

    const teamJoin = await auth.user
      .teamJoins()
      .where('team_id', team.id)
      .first()

    const admin = await Role.findBy('slug', 'administrator')

    await teamJoin.roles().attach([admin.id])

    return team
  }

  /**
   * Display a single team.
   * GET teams/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ auth, params, request, response, view }) {
    const team = await auth.user
      .teams()
      .where('team_id', params.id)
      .first()
    return team
  }

  /**
   * Update team details.
   * PUT or PATCH teams/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ auth, params, request, response }) {
    const data = request.only(['name'])
    const team = await auth.user
      .teams()
      .where('team_id', params.id)
      .first()

    team.merge(data)

    await team.save()

    return team
  }

  /**
   * Delete a team with id.
   * DELETE teams/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ auth, params, request, response }) {
    const team = await auth.user
      .teams()
      .where('team_id', params.id)
      .first()

    await team.delete()
  }
}

module.exports = TeamController
